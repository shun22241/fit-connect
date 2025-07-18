-- PostgreSQL 初期化スクリプト
-- データベースの基本設定と拡張機能の有効化

-- UUID 拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 全文検索拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- パフォーマンス向上のためのインデックス設定
-- （Prisma マイグレーション後に実行される）

-- データベース設定の最適化
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- 統計情報拡張機能（パフォーマンス監視用）
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ログ設定
ALTER SYSTEM SET log_destination = 'stderr';
ALTER SYSTEM SET logging_collector = on;
ALTER SYSTEM SET log_directory = 'pg_log';
ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';
ALTER SYSTEM SET log_rotation_age = '1d';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;

-- 設定の反映
SELECT pg_reload_conf();

-- 初期化完了メッセージ
\echo 'PostgreSQL initialization completed successfully!'