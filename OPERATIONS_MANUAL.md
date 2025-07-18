# 🔧 FitConnect 運用マニュアル

## 📋 目次

1. [概要](#概要)
2. [システム構成](#システム構成)
3. [デプロイメント](#デプロイメント)
4. [日常運用](#日常運用)
5. [監視・アラート](#監視・アラート)
6. [バックアップ・復旧](#バックアップ・復旧)
7. [メンテナンス](#メンテナンス)
8. [トラブルシューティング](#トラブルシューティング)
9. [セキュリティ](#セキュリティ)
10. [パフォーマンス最適化](#パフォーマンス最適化)

## 概要

FitConnectは、フィットネス愛好者のためのソーシャルプラットフォームです。
このマニュアルでは、システムの運用・保守に必要な手順とベストプラクティスを説明します。

### 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, Prisma ORM
- **データベース**: PostgreSQL, Redis
- **認証**: Supabase Auth
- **インフラ**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **監視**: カスタム監視システム, Prometheus メトリクス
- **モバイル**: React Native (Expo)

## システム構成

### 🏗️ アーキテクチャ図

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │   Admin Panel   │
│   (Next.js)     │    │ (React Native)  │    │   (Next.js)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌─────────────────────────────────────────┐
          │            Load Balancer                │
          │              (Nginx)                   │
          └─────────────────┬───────────────────────┘
                            │
          ┌─────────────────────────────────────────┐
          │         Application Server              │
          │           (Next.js API)                 │
          └─────────────────┬───────────────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    │                       │                       │
┌───▼────┐         ┌────────▼────────┐         ┌────▼────┐
│PostgreSQL│         │     Redis       │         │ Supabase│
│Database  │         │     Cache       │         │  Auth   │
└──────────┘         └─────────────────┘         └─────────┘
```

### 🐳 Docker サービス構成

```yaml
services:
  app: # Next.js アプリケーション
  db: # PostgreSQL データベース
  redis: # Redis キャッシュ
  nginx: # リバースプロキシ
```

## デプロイメント

### 🚀 本番環境デプロイ

#### 1. 環境準備

```bash
# 1. リポジトリクローン
git clone https://github.com/your-org/fit-connect.git
cd fit-connect

# 2. 環境変数設定
cp .env.production .env
# 必要な環境変数を設定

# 3. Docker イメージビルド
docker-compose build --no-cache

# 4. データベースマイグレーション
docker-compose run --rm app npx prisma migrate deploy

# 5. シードデータ投入（初回のみ）
docker-compose run --rm app npx prisma db seed
```

#### 2. 本番環境起動

```bash
# サービス起動
docker-compose up -d

# ヘルスチェック
curl http://localhost/api/health

# ログ確認
docker-compose logs -f
```

#### 3. ゼロダウンタイムデプロイ

```bash
# 1. 新しいイメージをビルド
docker-compose build app

# 2. ローリングアップデート
docker-compose up -d --no-deps app

# 3. ヘルスチェック
./scripts/health-check.sh

# 4. 旧イメージのクリーンアップ
docker image prune -f
```

### 🔄 CI/CD パイプライン

GitHub Actions による自動デプロイが設定されています：

```yaml
# .github/workflows/ci.yml
- テスト実行
- セキュリティスキャン
- Docker イメージビルド
- 本番デプロイ
- 動作確認
```

## 日常運用

### 📅 日次タスク

#### 1. システムヘルスチェック

```bash
# システム状態確認
./scripts/health-check.sh

# リソース使用量確認
docker stats

# ログ確認
docker-compose logs --since 24h | grep ERROR
```

#### 2. バックアップ確認

```bash
# バックアップ状況確認
./scripts/backup.sh stats

# バックアップファイル確認
ls -la /var/backups/fitconnect/
```

#### 3. パフォーマンス確認

```bash
# レスポンス時間チェック
curl -w "@curl-format.txt" -o /dev/null http://localhost/api/health

# データベースパフォーマンス
./scripts/maintenance.sh stats
```

### 📊 週次タスク

#### 1. システムメンテナンス

```bash
# データベース最適化
./scripts/maintenance.sh optimize

# 古いログファイルの削除
find /var/log/fitconnect -name "*.log" -mtime +7 -delete

# Docker イメージクリーンアップ
docker system prune -f
```

#### 2. セキュリティ更新

```bash
# セキュリティパッチ適用
apt update && apt upgrade -y

# 依存関係の脆弱性チェック
npm audit

# セキュリティログ確認
grep "SECURITY" /var/log/fitconnect/app.log
```

### 🗓️ 月次タスク

#### 1. フルバックアップ

```bash
# 完全バックアップ実行
./scripts/backup.sh full

# バックアップの整合性確認
./scripts/restore.sh --test
```

#### 2. パフォーマンス分析

```bash
# 詳細パフォーマンス分析
./scripts/maintenance.sh analyze

# 容量使用量レポート
df -h > /tmp/disk-usage-$(date +%Y%m%d).txt
```

## 監視・アラート

### 📈 監視ダッシュボード

管理者ダッシュボードにアクセス：

- URL: `https://yourdomain.com/admin/dashboard`
- 監視項目：
  - システムリソース使用量
  - API レスポンス時間
  - データベース統計
  - エラー率
  - アクティブユーザー数

### 🚨 アラート設定

#### 1. アラートシステムセットアップ

```bash
# アラートシステム初期化
./scripts/alerts.sh setup

# 通知チャネル設定
export SLACK_WEBHOOK_URL="your-webhook-url"
export DISCORD_WEBHOOK_URL="your-discord-webhook"
export EMAIL_RECIPIENTS="admin@fitconnect.app"

# テスト通知送信
./scripts/alerts.sh test
```

#### 2. 監視閾値

| メトリクス     | 警告閾値 | 緊急閾値 |
| -------------- | -------- | -------- |
| CPU使用率      | 80%      | 95%      |
| メモリ使用率   | 85%      | 95%      |
| ディスク使用率 | 80%      | 90%      |
| API応答時間    | 1000ms   | 3000ms   |
| エラー率       | 1%       | 5%       |

#### 3. アラート対応手順

```bash
# 1. アラート確認
./scripts/alerts.sh list

# 2. システム状態確認
./scripts/health-check.sh

# 3. ログ確認
docker-compose logs -f --since 1h

# 4. 必要に応じて対応措置
# - リソース不足 → スケールアップ
# - アプリエラー → ログ解析・修正
# - DB問題 → メンテナンス実行
```

## バックアップ・復旧

### 💾 バックアップ戦略

#### 1. 自動バックアップ設定

```bash
# 日次バックアップ (crontab)
0 2 * * * /path/to/fit-connect/scripts/backup.sh full

# 増分バックアップ (6時間ごと)
0 */6 * * * /path/to/fit-connect/scripts/backup.sh incremental
```

#### 2. バックアップ種類

| タイプ | 頻度  | 保存期間 | 内容                 |
| ------ | ----- | -------- | -------------------- |
| フル   | 日次  | 30日     | DB + ファイル + 設定 |
| 増分   | 6時間 | 7日      | 変更分のみ           |
| 設定   | 週次  | 90日     | 設定ファイル         |

#### 3. バックアップ実行

```bash
# フルバックアップ
./scripts/backup.sh full

# データベースのみ
./scripts/backup.sh database

# ファイルのみ
./scripts/backup.sh uploads

# バックアップ一覧確認
./scripts/backup.sh list
```

### 🔄 復旧手順

#### 1. データベース復旧

```bash
# 1. アプリケーション停止
docker-compose stop app

# 2. データベース復旧
./scripts/restore.sh /path/to/backup.sql.gz --type=database

# 3. データ整合性確認
docker-compose exec db psql -U postgres -d fitconnect -c "SELECT COUNT(*) FROM \"User\";"

# 4. アプリケーション再起動
docker-compose start app
```

#### 2. 完全システム復旧

```bash
# 1. 全サービス停止
docker-compose down

# 2. データ削除
sudo rm -rf ./uploads ./data

# 3. フル復旧実行
./scripts/restore.sh --type=full

# 4. サービス再起動
docker-compose up -d

# 5. ヘルスチェック
./scripts/health-check.sh
```

#### 3. 災害復旧計画 (DR)

1. **RTO (復旧時間目標)**: 4時間
2. **RPO (復旧ポイント目標)**: 6時間
3. **復旧手順**:
   - 新しいサーバー準備
   - 最新バックアップからの復旧
   - DNS切り替え
   - 動作確認

## メンテナンス

### 🔧 定期メンテナンス

#### 1. データベースメンテナンス

```bash
# 統計情報更新
./scripts/maintenance.sh analyze

# インデックス再構築
./scripts/maintenance.sh reindex

# 不要データクリーンアップ
./scripts/maintenance.sh cleanup

# VACUUM実行
./scripts/maintenance.sh vacuum
```

#### 2. アプリケーションメンテナンス

```bash
# 依存関係更新
npm audit fix

# セキュリティパッチ適用
npm update

# ビルド最適化
npm run build:prod
```

#### 3. インフラメンテナンス

```bash
# OS更新
sudo apt update && sudo apt upgrade -y

# Docker更新
sudo apt install docker-ce docker-ce-cli containerd.io

# ログローテーション
sudo logrotate -f /etc/logrotate.conf
```

### 📅 メンテナンス計画

#### 月次メンテナンス窓口

- **日時**: 毎月第2土曜日 2:00-4:00 AM
- **内容**:
  - OS・ソフトウェア更新
  - データベース最適化
  - フルバックアップ・復旧テスト
  - セキュリティ監査

## トラブルシューティング

### 🚨 一般的な問題と対処法

#### 1. アプリケーションが起動しない

```bash
# 症状: サービスが起動しない
# 原因調査:
docker-compose logs app

# よくある原因:
# - 環境変数未設定 → .env ファイル確認
# - ポート競合 → netstat -tulpn | grep :3000
# - メモリ不足 → free -h
# - データベース接続エラー → DB状態確認
```

#### 2. データベース接続エラー

```bash
# 症状: "Database connection failed"
# 対処法:

# 1. データベースコンテナ状態確認
docker-compose ps db

# 2. データベース接続テスト
docker-compose exec db pg_isready -U postgres

# 3. 接続文字列確認
echo $DATABASE_URL

# 4. ネットワーク確認
docker network ls
```

#### 3. パフォーマンス問題

```bash
# 症状: レスポンスが遅い
# 調査手順:

# 1. システムリソース確認
top
free -h
df -h

# 2. データベースパフォーマンス
./scripts/maintenance.sh stats

# 3. スロークエリ分析
docker-compose exec db psql -U postgres -d fitconnect -c "
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"

# 4. Redis状態確認
docker-compose exec redis redis-cli info memory
```

#### 4. メモリリーク

```bash
# 症状: メモリ使用量が継続的に増加
# 対処法:

# 1. メモリ使用量監視
watch -n 5 'docker stats --no-stream'

# 2. Node.js ヒープダンプ
docker-compose exec app node --expose-gc app.js

# 3. 一時的対処（再起動）
docker-compose restart app

# 4. 根本原因調査
# - アプリケーションログ確認
# - コードレビュー
# - プロファイリング
```

### 📞 エスカレーション手順

1. **Level 1**: 自動復旧・基本対処
2. **Level 2**: オンコール担当者への通知
3. **Level 3**: 開発チームエスカレーション
4. **Level 4**: 外部専門家への相談

## セキュリティ

### 🔒 セキュリティ対策

#### 1. アクセス制御

```bash
# SSH キー認証のみ許可
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# ファイアウォール設定
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

#### 2. SSL/TLS設定

```bash
# Let's Encrypt証明書取得
sudo certbot --nginx -d yourdomain.com

# 証明書自動更新
sudo crontab -e
0 3 * * * certbot renew --quiet
```

#### 3. セキュリティ監視

```bash
# 失敗したログイン試行監視
sudo tail -f /var/log/auth.log | grep "Failed password"

# ネットワーク監視
sudo netstat -tulpn | grep :80

# ファイル整合性チェック
sudo find /etc -type f -name "*.conf" -exec sha256sum {} \; > /tmp/config-hashes.txt
```

#### 4. 脆弱性対策

```bash
# 定期的な脆弱性スキャン
npm audit
docker scan fitconnect:latest

# セキュリティ更新の自動適用
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 🛡️ インシデント対応

#### セキュリティインシデント対応手順

1. **検知・報告** (0-15分)
   - アラート確認
   - 初期評価
   - 関係者への通知

2. **封じ込め** (15-60分)
   - 影響範囲特定
   - 攻撃の遮断
   - 証拠保全

3. **根絶・復旧** (1-4時間)
   - 脆弱性修正
   - システム復旧
   - 監視強化

4. **事後対応** (1-7日)
   - 詳細調査
   - 報告書作成
   - 再発防止策実装

## パフォーマンス最適化

### ⚡ パフォーマンス監視

#### 1. メトリクス監視

```bash
# API レスポンス時間
curl -w "@curl-format.txt" -o /dev/null http://localhost/api/posts

# データベースクエリ時間
docker-compose exec db psql -U postgres -d fitconnect -c "
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;"

# Redis パフォーマンス
docker-compose exec redis redis-cli --latency-history
```

#### 2. 最適化手法

```bash
# データベース最適化
./scripts/maintenance.sh optimize

# Redis メモリ最適化
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru

# アプリケーション最適化
# - コード分割の確認
# - 画像最適化の確認
# - キャッシュ戦略の見直し
```

### 📊 容量計画

#### 成長予測とスケーリング

| メトリクス | 現在   | 6ヶ月後予測 | 1年後予測 |
| ---------- | ------ | ----------- | --------- |
| ユーザー数 | 1,000  | 5,000       | 10,000    |
| DB容量     | 1GB    | 5GB         | 10GB      |
| 日次PV     | 10,000 | 50,000      | 100,000   |

#### スケーリング戦略

1. **垂直スケーリング**
   - CPU/メモリ増強
   - SSD高速化

2. **水平スケーリング**
   - アプリケーションサーバー複数台
   - データベースレプリケーション
   - CDN導入

3. **クラウド移行**
   - コンテナオーケストレーション
   - マネージドサービス活用

## 📞 連絡先・サポート

### 緊急連絡先

- **システム管理者**: admin@fitconnect.app
- **開発チーム**: dev@fitconnect.app
- **セキュリティ**: security@fitconnect.app

### 外部サービス

- **Supabase**: [サポートページ](https://supabase.com/support)
- **OpenAI**: [API ステータス](https://status.openai.com/)
- **GitHub**: [ステータスページ](https://www.githubstatus.com/)

### 運用ツール

- **監視ダッシュボード**: `/admin/dashboard`
- **ログ管理**: `/var/log/fitconnect/`
- **バックアップ**: `/var/backups/fitconnect/`

---

最終更新: 2024年12月
バージョン: 1.0
作成者: FitConnect Development Team
