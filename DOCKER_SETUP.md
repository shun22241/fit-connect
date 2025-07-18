# 🐳 Docker セットアップガイド

FitConnect アプリケーションの Docker 環境構築手順です。

## 📋 前提条件

- Docker Desktop がインストールされていること
- Docker Compose が利用可能であること
- 8GB 以上の RAM を推奨

## 🚀 クイックスタート

### 1. 開発環境での起動

```bash
# 開発用 Docker Compose で起動
docker-compose -f docker-compose.dev.yml up -d

# ログの確認
docker-compose -f docker-compose.dev.yml logs -f app

# データベースマイグレーション実行
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy
docker-compose -f docker-compose.dev.yml exec app npx prisma db seed
```

### 2. 本番環境での起動

```bash
# 本番用 Docker Compose で起動
docker-compose up -d

# アプリケーションのログ確認
docker-compose logs -f app

# データベースマイグレーション実行
docker-compose exec app npx prisma migrate deploy
```

## 📂 Docker 構成

### 開発環境 (`docker-compose.dev.yml`)

- **app**: Next.js 開発サーバー（ホットリロード対応）
- **db**: PostgreSQL 15
- **redis**: Redis 7（キャッシュ・セッション管理）
- **pgadmin**: データベース管理ツール (http://localhost:5050)
- **redis-commander**: Redis 管理ツール (http://localhost:8081)

### 本番環境 (`docker-compose.yml`)

- **app**: Next.js 本番ビルド
- **db**: PostgreSQL 15
- **redis**: Redis 7
- **nginx**: リバースプロキシ・ロードバランサー

## 🛠 各サービスの詳細

### Next.js アプリケーション

```dockerfile
# Dockerfile: マルチステージビルド
FROM node:18-alpine AS base
# 本番用最適化イメージを構築
```

**ポート**: 3000
**機能**:

- 本番ビルドの最適化
- Prisma クライアントの自動生成
- セキュリティを考慮した非 root ユーザーでの実行

### PostgreSQL データベース

**ポート**: 5432
**設定**:

- 自動バックアップ対応
- パフォーマンス最適化済み設定
- UUID および全文検索拡張機能有効

### Redis

**ポート**: 6379
**用途**:

- セッション管理
- API レスポンスキャッシュ
- レート制限カウンター

### Nginx (本番環境のみ)

**ポート**: 80, 443
**機能**:

- リバースプロキシ
- 静的ファイル配信
- Gzip 圧縮
- レート制限
- セキュリティヘッダー設定
- SSL 終端 (証明書設定時)

## 🔧 環境設定

### 1. 環境変数ファイル

開発環境用の `.env` ファイルを作成:

```bash
# .env.local を基に作成
cp .env.development .env.local
```

### 2. データベース接続

```bash
# 開発環境
DATABASE_URL="postgresql://postgres:password@localhost:5432/fitconnect_dev"

# Docker 内からの接続
DATABASE_URL="postgresql://postgres:password@db:5432/fitconnect_dev"
```

## 📊 管理ツール

### pgAdmin (開発環境)

- URL: http://localhost:5050
- Email: admin@fitconnect.app
- Password: admin

**サーバー接続設定**:

- Host: db
- Port: 5432
- Database: fitconnect_dev
- Username: postgres
- Password: password

### Redis Commander (開発環境)

- URL: http://localhost:8081
- Redis接続: localhost:6379

## 🚀 デプロイコマンド

### ローカル開発

```bash
# 開発環境起動
make dev-up

# 開発環境停止
make dev-down

# ログ確認
make dev-logs
```

### 本番環境

```bash
# 本番環境ビルド
docker-compose build --no-cache

# 本番環境起動
docker-compose up -d

# ヘルスチェック
curl http://localhost/health
```

## 🔍 トラブルシューティング

### よくある問題

1. **ポート競合エラー**

```bash
# 使用中のポートを確認
netstat -tulpn | grep :3000
```

2. **データベース接続エラー**

```bash
# データベースコンテナのログ確認
docker-compose logs db
```

3. **Node.js ビルドエラー**

```bash
# node_modules を削除して再ビルド
docker-compose down
docker-compose build --no-cache app
```

### ログ確認コマンド

```bash
# 全サービスのログ
docker-compose logs -f

# 特定サービスのログ
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f nginx
```

### データベース操作

```bash
# データベースバックアップ
docker-compose exec db pg_dump -U postgres fitconnect > backup.sql

# データベースリストア
docker-compose exec -T db psql -U postgres fitconnect < backup.sql

# Prisma スキーマ同期
docker-compose exec app npx prisma db push
```

## 📈 パフォーマンス最適化

### Docker イメージサイズ削減

- マルチステージビルドの採用
- Alpine Linux ベースイメージの使用
- 不要なファイルの除外 (.dockerignore)

### メモリ使用量最適化

```bash
# コンテナのメモリ使用量確認
docker stats

# メモリ制限の設定
docker-compose up --scale app=2 --memory=512m
```

## 🔐 セキュリティ設定

### 1. 非 root ユーザーでの実行

### 2. セキュリティヘッダーの設定

### 3. ネットワーク分離

### 4. シークレット管理

```bash
# Docker secrets の使用例
echo "your-secret-key" | docker secret create nextauth_secret -
```

## 📚 参考資料

- [Next.js Docker デプロイメント](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker 公式ドキュメント](https://hub.docker.com/_/postgres)
- [Nginx Docker 設定](https://hub.docker.com/_/nginx)
- [Docker Compose ベストプラクティス](https://docs.docker.com/compose/production/)
