import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  console.log('🔍 ダッシュボードレイアウト: 認証チェック中...')

  // まずセッションを確認
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  console.log('📊 セッション状態:', {
    hasSession: !!session,
    sessionError: sessionError?.message,
    userId: session?.user?.id,
    email: session?.user?.email,
  })

  if (!session) {
    console.log('❌ セッションが見つからない - ログインページへリダイレクト')
    redirect('/login')
  }

  // セッションがある場合はユーザー情報を取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('👤 ユーザー情報:', {
    hasUser: !!user,
    userError: userError?.message,
    email: user?.email,
  })

  if (!user) {
    console.log('❌ ユーザー情報が取得できない - ログインページへリダイレクト')
    redirect('/login')
  }

  console.log('✅ ダッシュボードアクセス許可:', user.email)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                FitConnect
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
