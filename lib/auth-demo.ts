// デモ環境用の認証システム

interface DemoUser {
  id: string
  email: string
  password: string
  username: string
  plan: 'free' | 'premium' | 'pro'
  createdAt: Date
}

// デモユーザーデータ
const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-user-1',
    email: 'demo@fitconnect.com',
    password: 'demo123',
    username: 'デモユーザー',
    plan: 'premium',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-user-2',
    email: 'test@fitconnect.com',
    password: 'test123',
    username: 'テストユーザー',
    plan: 'free',
    createdAt: new Date('2024-01-15'),
  },
]

// ローカルストレージキー
const STORAGE_KEY = 'fitconnect_demo_auth'
const USERS_KEY = 'fitconnect_demo_users'

// 現在のユーザーセッションを取得
export function getDemoSession() {
  if (typeof window === 'undefined') return null

  try {
    const session = localStorage.getItem(STORAGE_KEY)
    return session ? JSON.parse(session) : null
  } catch {
    return null
  }
}

// ユーザーセッションを保存
export function setDemoSession(user: DemoUser) {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          username: user.username,
          plan: user.plan,
        },
      },
      access_token: 'demo_token_' + user.id,
      refresh_token: 'demo_refresh_' + user.id,
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24時間
    }),
  )
}

// セッションをクリア
export function clearDemoSession() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEY)
}

// デモ用ログイン
export async function demoSignIn(
  email: string,
  password: string,
): Promise<{ user: DemoUser | null; error: string | null }> {
  // 少し遅延を追加してリアルな感じに
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = DEMO_USERS.find(
    (u) => u.email === email && u.password === password,
  )

  if (!user) {
    return {
      user: null,
      error: 'メールアドレスまたはパスワードが正しくありません',
    }
  }

  setDemoSession(user)
  return { user, error: null }
}

// デモ用新規登録
export async function demoSignUp(
  email: string,
  password: string,
  username?: string,
): Promise<{ user: DemoUser | null; error: string | null }> {
  // 少し遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 800))

  // 既存ユーザーチェック
  const existingUser = DEMO_USERS.find((u) => u.email === email)
  if (existingUser) {
    return {
      user: null,
      error: 'このメールアドレスは既に使用されています',
    }
  }

  // 保存されたユーザーもチェック
  const savedUsers = getSavedDemoUsers()
  const existingSavedUser = savedUsers.find((u) => u.email === email)
  if (existingSavedUser) {
    return {
      user: null,
      error: 'このメールアドレスは既に使用されています',
    }
  }

  // 新しいユーザーを作成
  const newUser: DemoUser = {
    id: 'demo-user-' + Date.now(),
    email,
    password,
    username: username || email.split('@')[0],
    plan: 'free',
    createdAt: new Date(),
  }

  // ローカルストレージに保存
  savedUsers.push(newUser)
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(savedUsers))
  }

  setDemoSession(newUser)
  return { user: newUser, error: null }
}

// ログアウト
export function demoSignOut() {
  clearDemoSession()
}

// 保存されたデモユーザーを取得
function getSavedDemoUsers(): DemoUser[] {
  if (typeof window === 'undefined') return []

  try {
    const saved = localStorage.getItem(USERS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// 全デモユーザーを取得（デフォルト + 保存済み）
export function getAllDemoUsers(): DemoUser[] {
  return [...DEMO_USERS, ...getSavedDemoUsers()]
}

// ユーザーを検索
export function findDemoUser(email: string): DemoUser | null {
  const allUsers = getAllDemoUsers()
  return allUsers.find((u) => u.email === email) || null
}

// Supabase互換のレスポンス形式
export function formatDemoResponse(
  user: DemoUser | null,
  error: string | null,
) {
  if (error) {
    return {
      data: { user: null },
      error: { message: error },
    }
  }

  return {
    data: {
      user: user
        ? {
            id: user.id,
            email: user.email,
            user_metadata: {
              username: user.username,
              plan: user.plan,
            },
            created_at: user.createdAt.toISOString(),
          }
        : null,
    },
    error: null,
  }
}
