#!/bin/bash

# FitConnect アラートシステム設定スクリプト
# 使用方法: ./scripts/alerts.sh [setup|test|list]

set -e

# 設定
ALERT_CONFIG_DIR="${ALERT_CONFIG_DIR:-/etc/fitconnect/alerts}"
LOG_FILE="${LOG_FILE:-/var/log/fitconnect/alerts.log}"

# アラート設定
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90
ERROR_RATE_THRESHOLD=5
RESPONSE_TIME_THRESHOLD=1000

# 通知設定
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-admin@fitconnect.app}"
ALERT_COOLDOWN=300  # 5分間のクールダウン

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
    mkdir -p "$ALERT_CONFIG_DIR"
    echo "$(date): Starting alert system" >> "$LOG_FILE"
}

# Slack通知
send_slack_alert() {
    local title="$1"
    local message="$2"
    local severity="$3"
    local color="good"
    
    case "$severity" in
        "critical") color="danger" ;;
        "warning") color="warning" ;;
        "info") color="good" ;;
    esac
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"🚨 $title\",
                    \"text\": \"$message\",
                    \"footer\": \"FitConnect Alert System\",
                    \"footer_icon\": \"https://platform.slack-edge.com/img/default_application_icon.png\",
                    \"ts\": $(date +%s),
                    \"fields\": [
                        {
                            \"title\": \"Severity\",
                            \"value\": \"$severity\",
                            \"short\": true
                        },
                        {
                            \"title\": \"Server\",
                            \"value\": \"$(hostname)\",
                            \"short\": true
                        }
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1
        
        log_info "Slack alert sent: $title"
    else
        log_warn "Slack webhook URL not configured"
    fi
}

# Discord通知
send_discord_alert() {
    local title="$1"
    local message="$2"
    local severity="$3"
    local color=65280  # Green
    
    case "$severity" in
        "critical") color=16711680 ;;  # Red
        "warning") color=16776960 ;;   # Yellow
        "info") color=65280 ;;         # Green
    esac
    
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"embeds\": [{
                    \"title\": \"🚨 $title\",
                    \"description\": \"$message\",
                    \"color\": $color,
                    \"footer\": {
                        \"text\": \"FitConnect Alert System\"
                    },
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
                    \"fields\": [
                        {
                            \"name\": \"Severity\",
                            \"value\": \"$severity\",
                            \"inline\": true
                        },
                        {
                            \"name\": \"Server\",
                            \"value\": \"$(hostname)\",
                            \"inline\": true
                        }
                    ]
                }]
            }" \
            "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1
            
        log_info "Discord alert sent: $title"
    else
        log_warn "Discord webhook URL not configured"
    fi
}

# メール通知
send_email_alert() {
    local title="$1"
    local message="$2"
    local severity="$3"
    
    if command -v mail >/dev/null 2>&1; then
        echo "Alert: $title
        
Severity: $severity
Server: $(hostname)
Time: $(date)

Details:
$message

---
FitConnect Alert System" | mail -s "FitConnect Alert: $title" "$EMAIL_RECIPIENTS"
        
        log_info "Email alert sent: $title"
    else
        log_warn "Mail command not available"
    fi
}

# 統合アラート送信
send_alert() {
    local title="$1"
    local message="$2"
    local severity="${3:-warning}"
    local alert_key="$4"
    
    # クールダウンチェック
    if [ -n "$alert_key" ]; then
        local cooldown_file="$ALERT_CONFIG_DIR/.cooldown_$alert_key"
        if [ -f "$cooldown_file" ]; then
            local last_alert=$(cat "$cooldown_file")
            local current_time=$(date +%s)
            local time_diff=$((current_time - last_alert))
            
            if [ $time_diff -lt $ALERT_COOLDOWN ]; then
                log_info "Alert $alert_key in cooldown period (${time_diff}s < ${ALERT_COOLDOWN}s)"
                return 0
            fi
        fi
        
        echo "$(date +%s)" > "$cooldown_file"
    fi
    
    log_warn "ALERT: $title - $message"
    
    # 各チャネルに送信
    send_slack_alert "$title" "$message" "$severity"
    send_discord_alert "$title" "$message" "$severity"
    send_email_alert "$title" "$message" "$severity"
}

# システムリソース監視
check_system_resources() {
    log_info "Checking system resources..."
    
    # CPU使用率チェック
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    cpu_usage=${cpu_usage%.*}  # 小数点以下切り捨て
    
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        send_alert "High CPU Usage" \
            "CPU usage is ${cpu_usage}% (threshold: ${CPU_THRESHOLD}%)" \
            "warning" \
            "cpu_high"
    fi
    
    # メモリ使用率チェック
    local memory_info=$(free | grep Mem)
    local total_memory=$(echo $memory_info | awk '{print $2}')
    local used_memory=$(echo $memory_info | awk '{print $3}')
    local memory_usage=$(( (used_memory * 100) / total_memory ))
    
    if [ "$memory_usage" -gt "$MEMORY_THRESHOLD" ]; then
        send_alert "High Memory Usage" \
            "Memory usage is ${memory_usage}% (threshold: ${MEMORY_THRESHOLD}%)" \
            "warning" \
            "memory_high"
    fi
    
    # ディスク使用率チェック
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        send_alert "High Disk Usage" \
            "Disk usage is ${disk_usage}% (threshold: ${DISK_THRESHOLD}%)" \
            "critical" \
            "disk_high"
    fi
}

# アプリケーション監視
check_application_health() {
    log_info "Checking application health..."
    
    # ヘルスエンドポイントチェック
    local health_url="http://localhost/api/health"
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_url" || echo "000")
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$health_url" | awk '{print $1*1000}' || echo "0")
    
    if [ "$response_code" != "200" ]; then
        send_alert "Application Health Check Failed" \
            "Health endpoint returned HTTP $response_code" \
            "critical" \
            "health_failed"
    elif [ "${response_time%.*}" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
        send_alert "Slow Application Response" \
            "Health endpoint response time: ${response_time}ms (threshold: ${RESPONSE_TIME_THRESHOLD}ms)" \
            "warning" \
            "response_slow"
    fi
    
    # データベース接続チェック
    if ! docker exec fit-connect-db-1 pg_isready -U postgres > /dev/null 2>&1; then
        send_alert "Database Connection Failed" \
            "Unable to connect to PostgreSQL database" \
            "critical" \
            "db_connection"
    fi
    
    # Redis接続チェック
    if ! docker exec fit-connect-redis-1 redis-cli ping > /dev/null 2>&1; then
        send_alert "Redis Connection Failed" \
            "Unable to connect to Redis cache" \
            "critical" \
            "redis_connection"
    fi
}

# ログエラー監視
check_error_logs() {
    log_info "Checking error logs..."
    
    local log_file="/var/log/fitconnect/app.log"
    if [ -f "$log_file" ]; then
        # 直近1時間のエラー数をカウント
        local error_count=$(grep -c "ERROR" "$log_file" | tail -n 100 | wc -l)
        
        if [ "$error_count" -gt "$ERROR_RATE_THRESHOLD" ]; then
            local recent_errors=$(grep "ERROR" "$log_file" | tail -3 | awk '{print $0}')
            send_alert "High Error Rate" \
                "Found $error_count errors in the last hour (threshold: $ERROR_RATE_THRESHOLD). Recent errors:\n$recent_errors" \
                "warning" \
                "error_rate_high"
        fi
    fi
}

# セキュリティ監視
check_security_events() {
    log_info "Checking security events..."
    
    # 失敗したログイン試行をチェック
    local auth_log="/var/log/auth.log"
    if [ -f "$auth_log" ]; then
        local failed_logins=$(grep "Failed password" "$auth_log" | wc -l)
        if [ "$failed_logins" -gt 10 ]; then
            send_alert "High Failed Login Attempts" \
                "Detected $failed_logins failed login attempts" \
                "warning" \
                "failed_logins"
        fi
    fi
    
    # 異常なネットワークトラフィックをチェック
    local connections=$(netstat -an | grep :80 | wc -l)
    if [ "$connections" -gt 1000 ]; then
        send_alert "High Network Connections" \
            "Detected $connections active connections to port 80" \
            "warning" \
            "high_connections"
    fi
}

# アラート設定のセットアップ
setup_alerts() {
    log_info "Setting up alert system..."
    
    # 設定ディレクトリの作成
    mkdir -p "$ALERT_CONFIG_DIR"
    
    # Cronジョブの設定
    local cron_entry="*/5 * * * * $PWD/scripts/alerts.sh monitor"
    
    # 既存のcronジョブをチェック
    if ! crontab -l 2>/dev/null | grep -q "alerts.sh monitor"; then
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        log_success "Cron job added for alert monitoring"
    else
        log_info "Cron job already exists"
    fi
    
    # 設定ファイルの作成
    cat > "$ALERT_CONFIG_DIR/config.sh" << EOF
#!/bin/bash
# FitConnect Alert Configuration

# Thresholds
CPU_THRESHOLD=$CPU_THRESHOLD
MEMORY_THRESHOLD=$MEMORY_THRESHOLD
DISK_THRESHOLD=$DISK_THRESHOLD
ERROR_RATE_THRESHOLD=$ERROR_RATE_THRESHOLD
RESPONSE_TIME_THRESHOLD=$RESPONSE_TIME_THRESHOLD

# Notification settings
SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL"
DISCORD_WEBHOOK_URL="$DISCORD_WEBHOOK_URL"
EMAIL_RECIPIENTS="$EMAIL_RECIPIENTS"
ALERT_COOLDOWN=$ALERT_COOLDOWN

# Monitoring intervals
SYSTEM_CHECK_INTERVAL=300    # 5 minutes
APP_CHECK_INTERVAL=60        # 1 minute
LOG_CHECK_INTERVAL=600       # 10 minutes
SECURITY_CHECK_INTERVAL=900  # 15 minutes
EOF

    chmod +x "$ALERT_CONFIG_DIR/config.sh"
    log_success "Alert system setup completed"
}

# アラートテスト
test_alerts() {
    log_info "Testing alert system..."
    
    send_alert "Test Alert - Info" \
        "This is a test information alert" \
        "info" \
        "test_info"
    
    send_alert "Test Alert - Warning" \
        "This is a test warning alert" \
        "warning" \
        "test_warning"
    
    send_alert "Test Alert - Critical" \
        "This is a test critical alert" \
        "critical" \
        "test_critical"
    
    log_success "Alert test completed"
}

# アクティブアラートの一覧表示
list_active_alerts() {
    log_info "Active alerts and cooldowns:"
    
    if [ -d "$ALERT_CONFIG_DIR" ]; then
        for cooldown_file in "$ALERT_CONFIG_DIR"/.cooldown_*; do
            if [ -f "$cooldown_file" ]; then
                local alert_key=$(basename "$cooldown_file" | sed 's/^\.cooldown_//')
                local last_alert=$(cat "$cooldown_file")
                local current_time=$(date +%s)
                local time_diff=$((current_time - last_alert))
                local remaining=$((ALERT_COOLDOWN - time_diff))
                
                if [ $remaining -gt 0 ]; then
                    echo "  🔕 $alert_key: ${remaining}s remaining"
                else
                    echo "  ✅ $alert_key: ready"
                fi
            fi
        done
    else
        echo "  No active alerts"
    fi
}

# 監視実行
run_monitoring() {
    log_info "Running monitoring checks..."
    
    # 設定ファイルの読み込み
    if [ -f "$ALERT_CONFIG_DIR/config.sh" ]; then
        source "$ALERT_CONFIG_DIR/config.sh"
    fi
    
    check_system_resources
    check_application_health
    check_error_logs
    check_security_events
    
    log_success "Monitoring checks completed"
}

# 使用方法の表示
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup      Setup alert system and cron jobs"
    echo "  monitor    Run monitoring checks"
    echo "  test       Send test alerts"
    echo "  list       List active alerts and cooldowns"
    echo "  --help     Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  SLACK_WEBHOOK_URL     Slack webhook URL for notifications"
    echo "  DISCORD_WEBHOOK_URL   Discord webhook URL for notifications"
    echo "  EMAIL_RECIPIENTS      Email addresses for notifications"
}

# メイン関数
main() {
    local command="${1:-help}"
    
    setup_logging
    
    case "$command" in
        "setup")
            setup_alerts
            ;;
        "monitor")
            run_monitoring
            ;;
        "test")
            test_alerts
            ;;
        "list")
            list_active_alerts
            ;;
        "--help"|"help"|*)
            show_usage
            exit 0
            ;;
    esac
}

# スクリプト実行
main "$@"