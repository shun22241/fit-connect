#!/bin/bash

# FitConnect バックアップスクリプト
# 使用方法: ./scripts/backup.sh [full|incremental|logs]

set -e

# 設定
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fitconnect}"
DB_CONTAINER="${DB_CONTAINER:-fit-connect-db-1}"
REDIS_CONTAINER="${REDIS_CONTAINER:-fit-connect-redis-1}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-fitconnect-backups}"

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

# バックアップディレクトリの作成
setup_backup_dir() {
    log_info "Setting up backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"/{database,redis,uploads,logs,config}
}

# データベースバックアップ
backup_database() {
    local backup_type=${1:-full}
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/database/db_${backup_type}_${timestamp}.sql"
    
    log_info "Starting database backup (${backup_type})..."
    
    if [ "$backup_type" = "full" ]; then
        docker exec -e PGPASSWORD=password $DB_CONTAINER pg_dump \
            -h localhost -U postgres -d fitconnect \
            --verbose --clean --if-exists --no-owner --no-privileges \
            > "$backup_file"
    else
        # 増分バックアップ（WALファイルを使用）
        docker exec -e PGPASSWORD=password $DB_CONTAINER pg_basebackup \
            -h localhost -U postgres -D /tmp/backup_${timestamp} \
            --wal-method=stream --verbose
        
        docker cp $DB_CONTAINER:/tmp/backup_${timestamp} "$BACKUP_DIR/database/"
    fi
    
    # 圧縮
    if [ -f "$backup_file" ]; then
        gzip "$backup_file"
        backup_file="${backup_file}.gz"
    fi
    
    log_success "Database backup completed: $backup_file"
    echo "$backup_file"
}

# Redisバックアップ
backup_redis() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/redis/redis_${timestamp}.rdb"
    
    log_info "Starting Redis backup..."
    
    # Redis保存コマンドを実行
    docker exec $REDIS_CONTAINER redis-cli BGSAVE
    
    # 完了を待つ
    while [ "$(docker exec $REDIS_CONTAINER redis-cli LASTSAVE)" = "$(docker exec $REDIS_CONTAINER redis-cli LASTSAVE)" ]; do
        sleep 1
    done
    
    # RDBファイルをコピー
    docker cp $REDIS_CONTAINER:/data/dump.rdb "$backup_file"
    
    # 圧縮
    gzip "$backup_file"
    backup_file="${backup_file}.gz"
    
    log_success "Redis backup completed: $backup_file"
    echo "$backup_file"
}

# アップロードファイルのバックアップ
backup_uploads() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/uploads/uploads_${timestamp}.tar.gz"
    
    log_info "Starting uploads backup..."
    
    if [ -d "./uploads" ]; then
        tar -czf "$backup_file" -C . uploads/
        log_success "Uploads backup completed: $backup_file"
        echo "$backup_file"
    else
        log_warn "Uploads directory not found, skipping..."
    fi
}

# ログファイルのバックアップ
backup_logs() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/logs/logs_${timestamp}.tar.gz"
    
    log_info "Starting logs backup..."
    
    if [ -d "./logs" ]; then
        tar -czf "$backup_file" -C . logs/
        log_success "Logs backup completed: $backup_file"
        echo "$backup_file"
    else
        log_warn "Logs directory not found, skipping..."
    fi
}

# 設定ファイルのバックアップ
backup_config() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/config/config_${timestamp}.tar.gz"
    
    log_info "Starting config backup..."
    
    tar -czf "$backup_file" \
        --exclude='.env*' \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='.next' \
        docker-compose*.yml \
        Dockerfile* \
        package*.json \
        prisma/ \
        next.config.mjs \
        tailwind.config.js \
        tsconfig.json 2>/dev/null || true
    
    log_success "Config backup completed: $backup_file"
    echo "$backup_file"
}

# S3アップロード
upload_to_s3() {
    local file_path="$1"
    local s3_key="$(basename "$file_path")"
    
    if [ -n "$S3_BUCKET" ] && command -v aws >/dev/null 2>&1; then
        log_info "Uploading to S3: s3://$S3_BUCKET/$s3_key"
        aws s3 cp "$file_path" "s3://$S3_BUCKET/$s3_key" \
            --storage-class STANDARD_IA \
            --server-side-encryption AES256
        log_success "S3 upload completed"
    else
        log_warn "S3 upload skipped (AWS CLI not available or S3_BUCKET not set)"
    fi
}

# 古いバックアップの削除
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -type f -name "*.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -type f -name "*.sql" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    log_success "Cleanup completed"
}

# バックアップの検証
verify_backup() {
    local backup_file="$1"
    
    log_info "Verifying backup: $backup_file"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # ファイルサイズチェック
    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [ "$file_size" -lt 1000 ]; then
        log_error "Backup file too small: $file_size bytes"
        return 1
    fi
    
    # gzipファイルの整合性チェック
    if [[ "$backup_file" == *.gz ]]; then
        if ! gzip -t "$backup_file"; then
            log_error "Backup file corrupted: $backup_file"
            return 1
        fi
    fi
    
    log_success "Backup verification passed"
    return 0
}

# Slackに通知
send_slack_notification() {
    local status="$1"
    local message="$2"
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        local emoji="✅"
        
        if [ "$status" = "error" ]; then
            color="danger"
            emoji="❌"
        elif [ "$status" = "warning" ]; then
            color="warning"
            emoji="⚠️"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"$emoji FitConnect Backup Report\",
                    \"text\": \"$message\",
                    \"footer\": \"$(hostname)\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# メイン実行関数
main() {
    local backup_type="${1:-full}"
    local start_time=$(date +%s)
    
    log_info "Starting FitConnect backup process (type: $backup_type)"
    
    setup_backup_dir
    
    local backup_files=()
    local failed_backups=()
    
    case "$backup_type" in
        "full")
            log_info "Performing full backup..."
            
            # データベースバックアップ
            if db_file=$(backup_database "full"); then
                if verify_backup "$db_file"; then
                    backup_files+=("$db_file")
                    upload_to_s3 "$db_file"
                else
                    failed_backups+=("database")
                fi
            else
                failed_backups+=("database")
            fi
            
            # Redisバックアップ
            if redis_file=$(backup_redis); then
                if verify_backup "$redis_file"; then
                    backup_files+=("$redis_file")
                    upload_to_s3 "$redis_file"
                else
                    failed_backups+=("redis")
                fi
            else
                failed_backups+=("redis")
            fi
            
            # アップロードファイルバックアップ
            if uploads_file=$(backup_uploads); then
                if verify_backup "$uploads_file"; then
                    backup_files+=("$uploads_file")
                    upload_to_s3 "$uploads_file"
                else
                    failed_backups+=("uploads")
                fi
            fi
            
            # 設定ファイルバックアップ
            if config_file=$(backup_config); then
                if verify_backup "$config_file"; then
                    backup_files+=("$config_file")
                    upload_to_s3 "$config_file"
                else
                    failed_backups+=("config")
                fi
            fi
            ;;
            
        "incremental")
            log_info "Performing incremental backup..."
            if db_file=$(backup_database "incremental"); then
                backup_files+=("$db_file")
                upload_to_s3 "$db_file"
            else
                failed_backups+=("database")
            fi
            ;;
            
        "logs")
            log_info "Performing logs backup..."
            if logs_file=$(backup_logs); then
                if verify_backup "$logs_file"; then
                    backup_files+=("$logs_file")
                    upload_to_s3 "$logs_file"
                else
                    failed_backups+=("logs")
                fi
            fi
            ;;
            
        *)
            log_error "Invalid backup type: $backup_type"
            log_info "Usage: $0 [full|incremental|logs]"
            exit 1
            ;;
    esac
    
    # クリーンアップ
    cleanup_old_backups
    
    # 実行時間計算
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # 結果レポート
    log_info "Backup process completed in ${duration} seconds"
    log_info "Successfully backed up ${#backup_files[@]} components"
    
    if [ ${#failed_backups[@]} -gt 0 ]; then
        log_error "Failed backups: ${failed_backups[*]}"
        send_slack_notification "error" "Backup completed with errors. Failed: ${failed_backups[*]}. Duration: ${duration}s"
        exit 1
    else
        log_success "All backups completed successfully!"
        send_slack_notification "success" "Backup completed successfully. Components: ${#backup_files[@]}. Duration: ${duration}s"
    fi
}

# スクリプト実行
main "$@"