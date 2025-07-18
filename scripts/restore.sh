#!/bin/bash

# FitConnect リストアスクリプト
# 使用方法: ./scripts/restore.sh [backup_file] [--type=database|redis|uploads|full]

set -e

# 設定
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fitconnect}"
DB_CONTAINER="${DB_CONTAINER:-fit-connect-db-1}"
REDIS_CONTAINER="${REDIS_CONTAINER:-fit-connect-redis-1}"

# 色付きログ
log_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

log_warn() {
    echo -e "\033[1;33m[WARN]\033[0m $1"
}

# 使用方法の表示
show_usage() {
    echo "Usage: $0 [backup_file] [options]"
    echo ""
    echo "Options:"
    echo "  --type=TYPE     Restore type (database|redis|uploads|full)"
    echo "  --force         Skip confirmation prompts"
    echo "  --list          List available backups"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --list"
    echo "  $0 /path/to/backup.sql.gz --type=database"
    echo "  $0 --type=full --force"
}

# 利用可能なバックアップの一覧表示
list_backups() {
    log_info "Available backups in $BACKUP_DIR:"
    echo ""
    
    for type in database redis uploads logs config; do
        local dir="$BACKUP_DIR/$type"
        if [ -d "$dir" ]; then
            echo "📁 $type:"
            find "$dir" -name "*.gz" -o -name "*.sql" | sort -r | head -5 | while read file; do
                local size=$(ls -lh "$file" | awk '{print $5}')
                local date=$(ls -l "$file" | awk '{print $6, $7, $8}')
                echo "  📄 $(basename "$file") ($size, $date)"
            done
            echo ""
        fi
    done
}

# 確認プロンプト
confirm_action() {
    local message="$1"
    if [ "$FORCE" = "true" ]; then
        return 0
    fi
    
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

# データベースリストア
restore_database() {
    local backup_file="$1"
    
    log_info "Starting database restore from: $backup_file"
    
    # バックアップファイルの存在確認
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # 確認
    if ! confirm_action "⚠️  This will overwrite the current database. Continue?"; then
        log_info "Database restore cancelled"
        return 1
    fi
    
    # データベース停止前の準備
    log_info "Preparing database for restore..."
    
    # 一時ファイル作成
    local temp_file="/tmp/restore_$(date +%s).sql"
    
    # ファイルの解凍
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$temp_file"
    else
        cp "$backup_file" "$temp_file"
    fi
    
    # アプリケーション停止
    log_info "Stopping application containers..."
    docker-compose stop app
    
    # データベースへの接続を終了
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d postgres \
        -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'fitconnect' AND pid != pg_backend_pid();"
    
    # データベース削除・再作成
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d postgres \
        -c "DROP DATABASE IF EXISTS fitconnect;"
    
    docker exec -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d postgres \
        -c "CREATE DATABASE fitconnect;"
    
    # リストア実行
    log_info "Restoring database..."
    docker exec -i -e PGPASSWORD=password $DB_CONTAINER psql \
        -h localhost -U postgres -d fitconnect < "$temp_file"
    
    # 一時ファイル削除
    rm -f "$temp_file"
    
    # アプリケーション再起動
    log_info "Restarting application..."
    docker-compose start app
    
    # ヘルスチェック
    log_info "Performing health check..."
    sleep 10
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "Database restore completed successfully!"
    else
        log_warn "Database restore completed, but health check failed"
    fi
}

# Redisリストア
restore_redis() {
    local backup_file="$1"
    
    log_info "Starting Redis restore from: $backup_file"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    if ! confirm_action "⚠️  This will overwrite the current Redis data. Continue?"; then
        log_info "Redis restore cancelled"
        return 1
    fi
    
    # Redis停止
    log_info "Stopping Redis container..."
    docker-compose stop redis
    
    # 一時ファイル作成
    local temp_file="/tmp/restore_redis_$(date +%s).rdb"
    
    # ファイルの解凍
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$temp_file"
    else
        cp "$backup_file" "$temp_file"
    fi
    
    # RDBファイルをコンテナにコピー
    docker cp "$temp_file" $REDIS_CONTAINER:/data/dump.rdb
    
    # 一時ファイル削除
    rm -f "$temp_file"
    
    # Redis再起動
    log_info "Restarting Redis container..."
    docker-compose start redis
    
    # 接続テスト
    sleep 5
    if docker exec $REDIS_CONTAINER redis-cli ping | grep -q PONG; then
        log_success "Redis restore completed successfully!"
    else
        log_error "Redis restore failed - connection test failed"
        return 1
    fi
}

# アップロードファイルのリストア
restore_uploads() {
    local backup_file="$1"
    
    log_info "Starting uploads restore from: $backup_file"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    if ! confirm_action "⚠️  This will overwrite current upload files. Continue?"; then
        log_info "Uploads restore cancelled"
        return 1
    fi
    
    # 既存のアップロードディレクトリをバックアップ
    if [ -d "./uploads" ]; then
        log_info "Backing up existing uploads directory..."
        mv "./uploads" "./uploads.backup.$(date +%s)"
    fi
    
    # リストア実行
    log_info "Extracting uploads..."
    tar -xzf "$backup_file"
    
    log_success "Uploads restore completed successfully!"
}

# 最新のバックアップファイルを取得
get_latest_backup() {
    local backup_type="$1"
    local backup_dir="$BACKUP_DIR/$backup_type"
    
    if [ -d "$backup_dir" ]; then
        find "$backup_dir" -name "*.gz" -o -name "*.sql" | sort -r | head -1
    fi
}

# フルリストア
restore_full() {
    log_info "Starting full system restore..."
    
    if ! confirm_action "⚠️  This will restore the entire system from backups. Continue?"; then
        log_info "Full restore cancelled"
        return 1
    fi
    
    local success_count=0
    local total_count=0
    
    # データベースリストア
    local db_backup=$(get_latest_backup "database")
    if [ -n "$db_backup" ]; then
        ((total_count++))
        log_info "Restoring database from: $db_backup"
        if restore_database "$db_backup"; then
            ((success_count++))
        fi
    else
        log_warn "No database backup found"
    fi
    
    # Redisリストア
    local redis_backup=$(get_latest_backup "redis")
    if [ -n "$redis_backup" ]; then
        ((total_count++))
        log_info "Restoring Redis from: $redis_backup"
        if restore_redis "$redis_backup"; then
            ((success_count++))
        fi
    else
        log_warn "No Redis backup found"
    fi
    
    # アップロードファイルリストア
    local uploads_backup=$(get_latest_backup "uploads")
    if [ -n "$uploads_backup" ]; then
        ((total_count++))
        log_info "Restoring uploads from: $uploads_backup"
        if restore_uploads "$uploads_backup"; then
            ((success_count++))
        fi
    else
        log_warn "No uploads backup found"
    fi
    
    log_info "Full restore completed: $success_count/$total_count components restored successfully"
    
    if [ $success_count -eq $total_count ] && [ $total_count -gt 0 ]; then
        log_success "Full restore completed successfully!"
        return 0
    else
        log_error "Full restore completed with errors"
        return 1
    fi
}

# メイン関数
main() {
    local backup_file=""
    local restore_type=""
    local force=false
    
    # 引数解析
    while [[ $# -gt 0 ]]; do
        case $1 in
            --type=*)
                restore_type="${1#*=}"
                shift
                ;;
            --force)
                FORCE="true"
                shift
                ;;
            --list)
                list_backups
                exit 0
                ;;
            --help)
                show_usage
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                backup_file="$1"
                shift
                ;;
        esac
    done
    
    log_info "Starting FitConnect restore process"
    
    case "$restore_type" in
        "database")
            if [ -z "$backup_file" ]; then
                backup_file=$(get_latest_backup "database")
                if [ -z "$backup_file" ]; then
                    log_error "No database backup found"
                    exit 1
                fi
                log_info "Using latest database backup: $backup_file"
            fi
            restore_database "$backup_file"
            ;;
        "redis")
            if [ -z "$backup_file" ]; then
                backup_file=$(get_latest_backup "redis")
                if [ -z "$backup_file" ]; then
                    log_error "No Redis backup found"
                    exit 1
                fi
                log_info "Using latest Redis backup: $backup_file"
            fi
            restore_redis "$backup_file"
            ;;
        "uploads")
            if [ -z "$backup_file" ]; then
                backup_file=$(get_latest_backup "uploads")
                if [ -z "$backup_file" ]; then
                    log_error "No uploads backup found"
                    exit 1
                fi
                log_info "Using latest uploads backup: $backup_file"
            fi
            restore_uploads "$backup_file"
            ;;
        "full")
            restore_full
            ;;
        "")
            if [ -n "$backup_file" ]; then
                # バックアップファイルが指定された場合、拡張子から推測
                if [[ "$backup_file" == *"db_"* ]] || [[ "$backup_file" == *".sql"* ]]; then
                    restore_database "$backup_file"
                elif [[ "$backup_file" == *"redis_"* ]] || [[ "$backup_file" == *".rdb"* ]]; then
                    restore_redis "$backup_file"
                elif [[ "$backup_file" == *"uploads_"* ]]; then
                    restore_uploads "$backup_file"
                else
                    log_error "Cannot determine restore type from filename: $backup_file"
                    log_info "Please specify --type=database|redis|uploads|full"
                    exit 1
                fi
            else
                log_error "No backup file or restore type specified"
                show_usage
                exit 1
            fi
            ;;
        *)
            log_error "Invalid restore type: $restore_type"
            show_usage
            exit 1
            ;;
    esac
}

# スクリプト実行
main "$@"