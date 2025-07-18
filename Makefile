# FitConnect Docker 管理用 Makefile

.PHONY: help dev-up dev-down dev-logs prod-up prod-down prod-logs build clean migrate seed backup restore

# デフォルトターゲット
help:
	@echo "利用可能なコマンド:"
	@echo "  dev-up      - 開発環境を起動"
	@echo "  dev-down    - 開発環境を停止"
	@echo "  dev-logs    - 開発環境のログを表示"
	@echo "  prod-up     - 本番環境を起動"
	@echo "  prod-down   - 本番環境を停止"
	@echo "  prod-logs   - 本番環境のログを表示"
	@echo "  build       - アプリケーションをビルド"
	@echo "  clean       - 全てのコンテナとボリュームを削除"
	@echo "  migrate     - データベースマイグレーション実行"
	@echo "  seed        - データベースシードデータ投入"
	@echo "  backup      - データベースバックアップ"
	@echo "  restore     - データベースリストア"

# 開発環境管理
dev-up:
	@echo "🚀 開発環境を起動しています..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ 開発環境が起動しました"
	@echo "📱 アプリケーション: http://localhost:3000"
	@echo "🗄️  pgAdmin: http://localhost:5050"
	@echo "🔴 Redis Commander: http://localhost:8081"

dev-down:
	@echo "🛑 開発環境を停止しています..."
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ 開発環境が停止しました"

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-restart:
	@echo "🔄 開発環境を再起動しています..."
	make dev-down
	make dev-up

# 本番環境管理
prod-up:
	@echo "🚀 本番環境を起動しています..."
	docker-compose up -d
	@echo "✅ 本番環境が起動しました"
	@echo "🌐 アプリケーション: http://localhost"

prod-down:
	@echo "🛑 本番環境を停止しています..."
	docker-compose down
	@echo "✅ 本番環境が停止しました"

prod-logs:
	docker-compose logs -f

prod-restart:
	@echo "🔄 本番環境を再起動しています..."
	make prod-down
	make prod-up

# ビルド管理
build:
	@echo "🏗️  アプリケーションをビルドしています..."
	docker-compose build --no-cache
	@echo "✅ ビルドが完了しました"

build-dev:
	@echo "🏗️  開発環境用アプリケーションをビルドしています..."
	docker-compose -f docker-compose.dev.yml build --no-cache
	@echo "✅ 開発環境用ビルドが完了しました"

# クリーンアップ
clean:
	@echo "🧹 全てのコンテナとボリュームを削除しています..."
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f
	@echo "✅ クリーンアップが完了しました"

clean-images:
	@echo "🧹 未使用のDockerイメージを削除しています..."
	docker image prune -a -f
	@echo "✅ イメージのクリーンアップが完了しました"

# データベース管理
migrate:
	@echo "📊 データベースマイグレーションを実行しています..."
	docker-compose exec app npx prisma migrate deploy
	@echo "✅ マイグレーションが完了しました"

migrate-dev:
	@echo "📊 開発環境でデータベースマイグレーションを実行しています..."
	docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy
	@echo "✅ 開発環境マイグレーションが完了しました"

seed:
	@echo "🌱 シードデータを投入しています..."
	docker-compose exec app npx prisma db seed
	@echo "✅ シードデータの投入が完了しました"

seed-dev:
	@echo "🌱 開発環境にシードデータを投入しています..."
	docker-compose -f docker-compose.dev.yml exec app npx prisma db seed
	@echo "✅ 開発環境シードデータの投入が完了しました"

# バックアップ・リストア
backup:
	@echo "💾 データベースをバックアップしています..."
	mkdir -p backups
	docker-compose exec db pg_dump -U postgres fitconnect > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ バックアップが完了しました"

backup-dev:
	@echo "💾 開発環境データベースをバックアップしています..."
	mkdir -p backups
	docker-compose -f docker-compose.dev.yml exec db pg_dump -U postgres fitconnect_dev > backups/dev_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ 開発環境バックアップが完了しました"

restore:
	@echo "📥 データベースをリストアしています..."
	@read -p "バックアップファイルのパスを入力してください: " filepath; \
	docker-compose exec -T db psql -U postgres fitconnect < $$filepath
	@echo "✅ リストアが完了しました"

# ヘルスチェック
health:
	@echo "🩺 サービスのヘルスチェックを実行しています..."
	@echo "Next.js アプリケーション:"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "❌ アプリケーションが応答しません"
	@echo ""
	@echo "Nginx:"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost/health || echo "❌ Nginxが応答しません"
	@echo ""
	@echo "データベース:"
	@docker-compose exec db pg_isready -U postgres && echo "✅ データベースは正常です" || echo "❌ データベースが応答しません"

# 開発用便利コマンド
shell:
	@echo "🐚 アプリケーションコンテナに接続しています..."
	docker-compose exec app sh

shell-dev:
	@echo "🐚 開発環境アプリケーションコンテナに接続しています..."
	docker-compose -f docker-compose.dev.yml exec app sh

db-shell:
	@echo "🗄️  データベースに接続しています..."
	docker-compose exec db psql -U postgres fitconnect

db-shell-dev:
	@echo "🗄️  開発環境データベースに接続しています..."
	docker-compose -f docker-compose.dev.yml exec db psql -U postgres fitconnect_dev

# ログ管理
logs-app:
	docker-compose logs -f app

logs-db:
	docker-compose logs -f db

logs-nginx:
	docker-compose logs -f nginx

logs-redis:
	docker-compose logs -f redis

# 統計情報
stats:
	@echo "📊 Docker コンテナの統計情報:"
	docker stats --no-stream

# セットアップ用便利コマンド
setup-dev: dev-up migrate-dev seed-dev
	@echo "🎉 開発環境のセットアップが完了しました！"
	@echo "📱 アプリケーション: http://localhost:3000"

setup-prod: prod-up migrate seed
	@echo "🎉 本番環境のセットアップが完了しました！"
	@echo "🌐 アプリケーション: http://localhost"