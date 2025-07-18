import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Supabaseが設定されているかチェック
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    url &&
    key &&
    url !== 'https://your-project-id.supabase.co' &&
    url.startsWith('https://') &&
    key.startsWith('eyJ')
  )
}

export async function createClient() {
  if (isSupabaseConfigured()) {
    // 実際のSupabaseクライアント
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )
  }

  // デモ用のモッククライアント（サーバー側）
  // 開発環境では常にダミーユーザーを返す
  return {
    auth: {
      getUser: async () => {
        console.log('🎯 Server-side Demo Auth: Returning demo user')
        return {
          data: {
            user: {
              id: 'demo-user-1',
              email: 'demo@fitconnect.com',
              user_metadata: {
                username: 'デモユーザー',
                plan: 'premium',
              },
              created_at: new Date().toISOString(),
            },
          },
          error: null,
        }
      },

      getSession: async () => {
        return {
          data: {
            session: {
              user: {
                id: 'demo-user-1',
                email: 'demo@fitconnect.com',
                user_metadata: {
                  username: 'デモユーザー',
                  plan: 'premium',
                },
              },
              access_token: 'demo_token',
              refresh_token: 'demo_refresh',
              expires_at: Date.now() + 24 * 60 * 60 * 1000,
            },
          },
          error: null,
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
