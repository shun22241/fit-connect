# FitConnect - 筋トレSNSアプリ

ワークアウトを記録し、仲間とつながる筋トレ特化SNSアプリです。

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UIライブラリ**: shadcn/ui
- **バックエンド**: Supabase (認証・データベース・ストレージ)
- **ORM**: Prisma
- **デプロイ**: Vercel

## 📊 データベース設計

### 主要テーブル

- **users**: ユーザー情報
- **workouts**: ワークアウト記録
- **exercises**: エクササイズ詳細
- **posts**: SNS投稿
- **likes**: いいね機能
- **comments**: コメント機能
- **follows**: フォロー機能

## 🔧 セットアップ

### 1. 環境変数設定

`.env.local`ファイルを作成：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_database_url
```

### 2. 依存関係インストール

```bash
npm install
```

### 3. データベースマイグレーション

Supabaseプロジェクトで以下のSQLファイルを実行：

- `supabase/migrations/20240118000001_initial_schema.sql`
- `supabase/migrations/20240118000002_rls_policies.sql`

### 4. Prisma設定

```bash
npx prisma generate
npx prisma db seed  # サンプルデータ投入（オプション）
```

### 5. 開発サーバー起動

```bash
npm run dev
```

## 📱 主要機能

### Phase 1: 基本機能 ✅

- ユーザー認証（メール・Google）
- プロフィール管理
- 基本UI/UX

### Phase 2: データベース設計 ✅

- Prismaスキーマ設計
- Supabase RLS設定
- シードデータ作成

### Phase 3: コア機能（予定）

- ワークアウト記録
- SNS投稿・いいね・コメント
- フォロー機能

### Phase 4: PWA化（予定）

- オフライン対応
- プッシュ通知

### Phase 5: AI機能（予定）

- OpenAI統合
- パーソナライズアドバイス

## 🗄️ API エンドポイント

### 認証

- `POST /api/auth/login` - ログイン
- `POST /api/auth/signup` - サインアップ
- `POST /api/auth/logout` - ログアウト

### ユーザー

- `GET /api/users/[id]` - ユーザー情報取得
- `PUT /api/users/[id]` - ユーザー情報更新

### ワークアウト

- `GET /api/workouts` - ワークアウト一覧
- `POST /api/workouts` - ワークアウト作成
- `GET /api/workouts/[id]` - ワークアウト詳細
- `PUT /api/workouts/[id]` - ワークアウト更新
- `DELETE /api/workouts/[id]` - ワークアウト削除

### 投稿

- `GET /api/posts` - 投稿一覧
- `POST /api/posts` - 投稿作成
- `GET /api/posts/[id]` - 投稿詳細
- `PUT /api/posts/[id]` - 投稿更新
- `DELETE /api/posts/[id]` - 投稿削除

## 🔐 セキュリティ

- Supabase Row Level Security (RLS)有効
- 認証ユーザーのみAPI利用可能
- XSS/CSRF対策済み

## 📦 ビルド・デプロイ

```bash
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint実行
npm run format   # Prettier実行
```

## 🤝 コントリビューション

1. フォークする
2. フィーチャーブランチ作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. Pull Requestを作成

## 📄 ライセンス

MIT License
