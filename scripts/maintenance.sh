#!/bin/bash

# FitConnect データベースメンテナンススクリプト
# 使用方法: ./scripts/maintenance.sh [optimize|vacuum|reindex|stats|cleanup|all]

set -e

# 設定
DB_CONTAINER="${DB_CONTAINER:-fit-connect-db-1}"
REDIS_CONTAINER="${REDIS_CONTAINER:-fit-connect-redis-1}"
LOG_FILE="${LOG_FILE:-/var/log/fitconnect/maintenance.log}"

# 色付きログ
log_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "\033[1;33m[WARN]\033[0m $1" | tee -a "$LOG_FILE"
}

# ログディレクトリの作成
setup_logging() {
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "$(date): Starting maintenance process" >> "$LOG_FILE"
}

# データベース接続テスト
test_db_connection() {
    log_info "Testing database connection..."
    if docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database connection successful"
        return 0
    else
        log_error "Database connection failed"
        return 1
    fi
}

# データベース統計情報の取得
get_db_stats() {
    log_info "Collecting database statistics..."
    
    local stats_file="/tmp/db_stats_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Database Statistics ==="
        echo "Generated: $(date)"
        echo ""
        
        echo "--- Database Size ---"
        docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
            -h localhost -U postgres -d fitconnect \
            -c "SELECT pg_size_pretty(pg_database_size('fitconnect')) AS database_size;"
        
        echo ""
        echo "--- Table Sizes ---"
        docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
            -h localhost -U postgres -d fitconnect \
            -c "SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
                pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
                FROM pg_tables 
                WHERE schemaname = 'public' 
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
        
        echo ""
        echo "--- Row Counts ---"
        docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
            -h localhost -U postgres -d fitconnect \
            -c "SELECT 
                schemaname,
                tablename,
                n_tup_ins AS inserts,
                n_tup_upd AS updates,
                n_tup_del AS deletes,
                n_live_tup AS live_rows,
                n_dead_tup AS dead_rows
                FROM pg_stat_user_tables 
                ORDER BY n_live_tup DESC;"
        
        echo ""
        echo "--- Index Usage ---"
        docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
            -h localhost -U postgres -d fitconnect \
            -c "SELECT 
                schemaname,
                tablename,
                indexname,
                idx_tup_read,
                idx_tup_fetch,
                pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
                FROM pg_stat_user_indexes 
                ORDER BY idx_tup_read DESC;"
        
        echo ""
        echo "--- Long Running Queries ---"
        docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
            -h localhost -U postgres -d fitconnect \
            -c "SELECT 
                pid,
                now() - pg_stat_activity.query_start AS duration,
                query,
                state
                FROM pg_stat_activity 
                WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
                ORDER BY duration DESC;"
        
    } > "$stats_file"
    
    log_success "Database statistics saved to: $stats_file"
    cat "$stats_file"
}

# VACUUM操作
run_vacuum() {
    log_info "Starting VACUUM operation..."
    
    # 各テーブルに対してVACUUM実行
    local tables=("User" "Post" "Workout" "Exercise" "Comment" "Like" "Follow")
    
    for table in "${tables[@]}"; do
        log_info "VACUUM ANALYZE on table: $table"
        docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
            -h localhost -U postgres -d fitconnect \
            -c "VACUUM ANALYZE \"$table\";"
    done
    
    log_success "VACUUM operation completed"
}

# フルVACUUM操作（メンテナンス時間中のみ）
run_full_vacuum() {
    log_warn "Starting FULL VACUUM operation (this may take a long time)..."
    
    if ! confirm_action "⚠️  FULL VACUUM will lock tables. Continue?"; then
        log_info "FULL VACUUM cancelled"
        return 1
    fi
    
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -c "VACUUM FULL;"
    
    log_success "FULL VACUUM operation completed"
}

# REINDEX操作
run_reindex() {
    log_info "Starting REINDEX operation..."
    
    # データベース全体のREINDEX
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -c "REINDEX DATABASE fitconnect;"
    
    log_success "REINDEX operation completed"
}

# データクリーンアップ
cleanup_old_data() {
    log_info "Starting data cleanup..."
    
    local cleanup_date=$(date -d '90 days ago' '+%Y-%m-%d')
    log_info "Cleaning up data older than: $cleanup_date"
    
    # 古いログエントリの削除（90日より古い）
    local deleted_logs=$(docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -t -c "DELETE FROM \"Log\" WHERE \"createdAt\" < '$cleanup_date'; SELECT ROW_COUNT();")
    
    # 古い通知の削除（30日より古い）
    local notification_date=$(date -d '30 days ago' '+%Y-%m-%d')
    local deleted_notifications=$(docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -t -c "DELETE FROM \"Notification\" WHERE \"createdAt\" < '$notification_date' AND \"isRead\" = true; SELECT ROW_COUNT();")
    
    # 孤立したファイル参照の削除
    local deleted_orphans=$(docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -t -c "DELETE FROM \"File\" WHERE \"id\" NOT IN (
            SELECT \"imageUrl\" FROM \"Post\" WHERE \"imageUrl\" IS NOT NULL
            UNION
            SELECT \"avatarUrl\" FROM \"User\" WHERE \"avatarUrl\" IS NOT NULL
        ); SELECT ROW_COUNT();")
    
    log_success "Data cleanup completed:"
    log_info "  - Deleted logs: $deleted_logs"
    log_info "  - Deleted notifications: $deleted_notifications"
    log_info "  - Deleted orphaned files: $deleted_orphans"
}

# Redis メンテナンス
maintain_redis() {
    log_info "Starting Redis maintenance..."
    
    # Redis情報の取得
    log_info "Redis info:"
    docker exec $REDIS_CONTAINER redis-cli info memory
    
    # キーの統計
    log_info "Redis key statistics:"
    docker exec $REDIS_CONTAINER redis-cli --scan --pattern "*" | head -10
    
    # 期限切れキーのクリーンアップ
    log_info "Triggering Redis cleanup..."
    docker exec $REDIS_CONTAINER redis-cli eval "
        local keys = redis.call('keys', ARGV[1])
        local deleted = 0
        for i=1,#keys do
            if redis.call('ttl', keys[i]) == -1 then
                redis.call('del', keys[i])
                deleted = deleted + 1
            end
        end
        return deleted
    " 0 "*temp*"
    
    log_success "Redis maintenance completed"
}

# インデックス最適化
optimize_indexes() {
    log_info "Starting index optimization..."
    
    # 未使用インデックスの検出
    log_info "Checking for unused indexes..."
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -c "SELECT 
            schemaname,
            tablename,
            indexname,
            idx_tup_read,
            idx_tup_fetch,
            pg_size_pretty(pg_relation_size(indexrelid)) AS size
            FROM pg_stat_user_indexes 
            WHERE idx_tup_read = 0 AND idx_tup_fetch = 0
            ORDER BY pg_relation_size(indexrelid) DESC;"
    
    # 重複インデックスの検出
    log_info "Checking for duplicate indexes..."
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -c "SELECT 
            t1.schemaname,
            t1.tablename,
            t1.indexname AS index1,
            t2.indexname AS index2
            FROM pg_stat_user_indexes t1
            JOIN pg_stat_user_indexes t2 ON t1.tablename = t2.tablename
            WHERE t1.indexname < t2.indexname
            AND t1.schemaname = t2.schemaname;"
    
    log_success "Index optimization analysis completed"
}

# パフォーマンス分析
analyze_performance() {
    log_info "Starting performance analysis..."
    
    # 遅いクエリの分析
    log_info "Analyzing slow queries..."
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -c "SELECT 
            query,
            calls,
            total_time,
            mean_time,
            rows
            FROM pg_stat_statements 
            ORDER BY mean_time DESC 
            LIMIT 10;" 2>/dev/null || log_warn "pg_stat_statements not available"
    
    # 接続統計
    log_info "Connection statistics:"
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect \
        -c "SELECT 
            state,
            count(*) as connections
            FROM pg_stat_activity 
            WHERE datname = 'fitconnect'
            GROUP BY state;"
    
    log_success "Performance analysis completed"
}

# 確認プロンプト
confirm_action() {
    local message="$1"
    echo -n "$message (y/N): "
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# 使用方法の表示
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  optimize     Run database optimization (VACUUM + ANALYZE)"
    echo "  vacuum       Run VACUUM operation only"
    echo "  full-vacuum  Run FULL VACUUM (use during maintenance window)"
    echo "  reindex      Rebuild all indexes"
    echo "  cleanup      Clean up old data"
    echo "  stats        Show database statistics"
    echo "  redis        Maintain Redis cache"
    echo "  analyze      Performance analysis"
    echo "  all          Run all maintenance tasks"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 stats"
    echo "  $0 optimize"
    echo "  $0 all"
}

# メイン関数
main() {
    local operation="${1:-help}"
    local start_time=$(date +%s)
    
    setup_logging
    
    case "$operation" in
        "optimize")
            log_info "Starting database optimization..."
            test_db_connection
            run_vacuum
            optimize_indexes
            ;;
        "vacuum")
            test_db_connection
            run_vacuum
            ;;
        "full-vacuum")
            test_db_connection
            run_full_vacuum
            ;;
        "reindex")
            test_db_connection
            run_reindex
            ;;
        "cleanup")
            test_db_connection
            cleanup_old_data
            ;;
        "stats")
            test_db_connection
            get_db_stats
            ;;
        "redis")
            maintain_redis
            ;;
        "analyze")
            test_db_connection
            analyze_performance
            ;;
        "all")
            log_info "Starting full maintenance cycle..."
            test_db_connection
            get_db_stats
            run_vacuum
            optimize_indexes
            cleanup_old_data
            maintain_redis
            analyze_performance
            ;;
        "--help"|"help"|*)
            show_usage
            exit 0
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Maintenance completed in ${duration} seconds"
    echo "$(date): Maintenance completed ($operation) in ${duration}s" >> "$LOG_FILE"
}

# スクリプト実行
main "$@"