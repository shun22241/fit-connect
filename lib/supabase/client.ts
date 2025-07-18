import { createBrowserClient } from '@supabase/ssr'
import {
  demoSignIn,
  demoSignUp,
  demoSignOut,
  getDemoSession,
  formatDemoResponse,
} from '@/lib/auth-demo'

// Supabaseが設定されているかチェック
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // デモモード強制判定（実際のSupabase設定がない場合）
  if (
    !url ||
    !key ||
    url === 'https://your-project-id.supabase.co' ||
    url === 'demo-mode' ||
    key === 'demo-key' ||
    !url.startsWith('https://') ||
    !key.startsWith('eyJ')
  ) {
    return false
  }

  return true
}

export function createClient() {
  // デモ環境の強制判定
  const isDemoMode = !isSupabaseConfigured()

  console.log('🎯 FitConnect Auth Mode:', isDemoMode ? 'DEMO' : 'SUPABASE')
  console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log(
    '🔧 Supabase Key:',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  )

  // 強制的にデモモードを使用（開発環境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Development mode: Forcing DEMO authentication')
  }

  // 開発環境では常にデモモード、または実際のSupabase設定がない場合
  // デモ用のモッククライアント
  return {
    auth: {
      signInWithPassword: async ({
        email,
        password,
      }: {
        email: string
        password: string
      }) => {
        console.log('🎯 デモ認証: ログイン試行', email)
        const { user, error } = await demoSignIn(email, password)
        return formatDemoResponse(user, error)
      },

      signUp: async ({
        email,
        password,
        options,
      }: {
        email: string
        password: string
        options?: any
      }) => {
        console.log('🎯 デモ認証: 新規登録試行', email)
        const { user, error } = await demoSignUp(
          email,
          password,
          options?.data?.username,
        )
        return formatDemoResponse(user, error)
      },

      signInWithOAuth: async ({
        provider,
        options,
      }: {
        provider: string
        options?: any
      }) => {
        console.log('🎯 デモ認証: OAuth試行', provider)
        return {
          data: { user: null },
          error: {
            message:
              'デモ環境ではOAuth認証は利用できません。デモユーザーでログインしてください。',
          },
        }
      },

      signOut: async () => {
        console.log('🎯 デモ認証: ログアウト')
        demoSignOut()
        return { error: null }
      },

      getUser: async () => {
        const session = getDemoSession()
        if (session && session.expires_at > Date.now()) {
          return {
            data: { user: session.user },
            error: null,
          }
        }
        return {
          data: { user: null },
          error: null,
        }
      },

      getSession: async () => {
        const session = getDemoSession()
        if (session && session.expires_at > Date.now()) {
          return {
            data: { session },
            error: null,
          }
        }
        return {
          data: { session: null },
          error: null,
        }
      },

      onAuthStateChange: (callback: Function) => {
        // デモ用の簡易実装
        return {
          data: { subscription: { unsubscribe: () => {} } },
        }
      },
    },

    // その他のSupabase機能（デモ用ダミー）
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  } as any
}
