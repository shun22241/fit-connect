# 🔧 環境変数設定ガイド

FitConnectアプリケーションを実行するために必要な環境変数の設定方法を説明します。

## 📋 必要な環境変数

### 🔰 必須設定

#### 1. Supabase設定

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**取得方法:**

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. Settings → API → Project APIkeys からキーを取得

#### 2. データベース設定

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitconnect"
```

**設定方法:**

- ローカル開発: PostgreSQLをインストールして上記URLを使用
- 本番環境: クラウドデータベースのURLを設定

#### 3. AI機能（OpenAI）

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**取得方法:**

1. [OpenAI Platform](https://platform.openai.com/api-keys)でアカウント作成
2. API Keysページで新しいキーを生成

### 🔔 プッシュ通知設定（オプション）

#### VAPID キー生成

```bash
# プロジェクトディレクトリで実行
node -e "
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('Public Key:', keys.publicKey);
console.log('Private Key:', keys.privateKey);
"
```

#### 環境変数設定

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=生成されたpublic-key
VAPID_PRIVATE_KEY=生成されたprivate-key
VAPID_EMAIL=mailto:your-email@example.com
```

### 🔐 セキュリティ設定

#### NextAuth Secret生成

```bash
# Windows (Git Bash)
openssl rand -base64 32

# または Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```bash
NEXTAUTH_SECRET=生成されたsecret
NEXTAUTH_URL=http://localhost:3003
```

## 🚀 設定手順

### 1. 環境ファイル作成

```bash
# テンプレートをコピー
cp .env.example .env.local
```

### 2. 値を入力

`.env.local`ファイルを開いて、上記で取得した値を入力

### 3. データベース準備

```bash
# Prismaマイグレーション実行
npx prisma generate
npx prisma db push

# シードデータ投入（オプション）
npx prisma db seed
```

### 4. 動作確認

```bash
# 開発サーバー起動
npm run dev

# ビルドテスト
npm run build
```

## 🌍 デプロイ環境別設定

### Vercel

1. プロジェクト設定 → Environment Variables
2. 上記の環境変数をすべて追加
3. `NEXTAUTH_URL`を本番URLに変更

### Netlify

1. Site settings → Environment variables
2. 上記の環境変数をすべて追加
3. Build設定で`npm run build`を指定

### Docker

```dockerfile
# Dockerfile内で環境変数を設定
ENV NEXT_PUBLIC_SUPABASE_URL=your-url
ENV NEXTAUTH_SECRET=your-secret
# ... 他の環境変数
```

## ⚠️ セキュリティ注意事項

1. **`.env.local`をGitにコミットしない**
   - `.gitignore`に`.env.local`が含まれていることを確認

2. **プロダクションキーの管理**
   - 本番環境では専用のキーを使用
   - 開発と本番で異なるSupabaseプロジェクトを使用推奨

3. **キーの定期的な更新**
   - API キーは定期的に更新
   - 漏洩が疑われる場合は即座に無効化

## 🔍 トラブルシューティング

### よくあるエラー

#### Supabase接続エラー

```
Error: Invalid URL
```

→ `NEXT_PUBLIC_SUPABASE_URL`の形式を確認

#### OpenAI APIエラー

```
Error: Unauthorized
```

→ `OPENAI_API_KEY`が正しく設定されているか確認

#### プッシュ通知エラー

```
Error: Vapid public key should be 65 bytes long
```

→ VAPIDキーを再生成して設定

### デバッグ方法

1. **環境変数確認**

```bash
# Next.js内で確認
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

2. **接続テスト**

```bash
# Supabase接続テスト
npm run test:supabase

# データベース接続テスト
npx prisma db pull
```

## 📞 サポート

問題が解決しない場合:

1. 環境変数の値を再確認
2. キャッシュクリア: `npm run dev --reset-cache`
3. 依存関係再インストール: `rm -rf node_modules && npm install`
