'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      console.log('🔍 認証状態をチェック中...')
      
      // セッション情報を取得
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      const state = {
        timestamp: new Date().toISOString(),
        session: {
          data: sessionData,
          error: sessionError,
          hasSession: !!sessionData.session,
          accessToken: sessionData.session?.access_token ? 'あり' : 'なし',
          refreshToken: sessionData.session?.refresh_token ? 'あり' : 'なし',
          expiresAt: sessionData.session?.expires_at,
        },
        user: {
          data: userData,
          error: userError,
          hasUser: !!userData.user,
          userId: userData.user?.id,
          email: userData.user?.email,
          emailConfirmed: userData.user?.email_confirmed_at ? 'はい' : 'いいえ',
          createdAt: userData.user?.created_at,
        },
        browser: {
          localStorage: typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.includes('supabase')) : [],
          sessionStorage: typeof window !== 'undefined' ? Object.keys(sessionStorage).filter(k => k.includes('supabase')) : [],
          cookies: typeof document !== 'undefined' ? document.cookie : 'アクセス不可',
          url: typeof window !== 'undefined' ? window.location.href : '',
        }
      }
      
      console.log('📊 認証状態:', state)
      setAuthState(state)
    } catch (error) {
      console.error('❌ 認証チェックエラー:', error)
      setAuthState({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123'
      })
      
      console.log('🔐 テストログイン結果:', { data, error })
      await checkAuthState()
    } catch (error) {
      console.error('❌ テストログインエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const forceDashboard = () => {
    console.log('🚀 強制的にダッシュボードへ移動')
    router.push('/dashboard')
  }

  const clearAuth = async () => {
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
    await checkAuthState()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">認証状態を確認中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 認証デバッグツール</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">操作</h2>
            <div className="space-y-3">
              <button
                onClick={checkAuthState}
                disabled={loading}
                className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                🔄 認証状態を再チェック
              </button>
              <button
                onClick={testLogin}
                disabled={loading}
                className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                🔐 テストログイン
              </button>
              <button
                onClick={forceDashboard}
                className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                🚀 ダッシュボードに強制移動
              </button>
              <button
                onClick={clearAuth}
                className="w-full p-3 bg-red-500 text-white rounded hover:bg-red-600"
              >
                🧹 認証情報をクリア
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">認証状態サマリー</h2>
            {authState && (
              <div className="space-y-2 text-sm">
                <div className={`p-2 rounded ${authState.session?.hasSession ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  セッション: {authState.session?.hasSession ? 'あり' : 'なし'}
                </div>
                <div className={`p-2 rounded ${authState.user?.hasUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  ユーザー: {authState.user?.hasUser ? 'あり' : 'なし'}
                </div>
                {authState.user?.hasUser && (
                  <>
                    <div className="p-2 bg-gray-100 rounded">
                      メール: {authState.user.email}
                    </div>
                    <div className="p-2 bg-gray-100 rounded">
                      確認済み: {authState.user.emailConfirmed}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {authState && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">詳細な認証情報</h2>
            <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded max-h-96">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 トラブルシューティング</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>1. セッションが「なし」の場合 → ログインが正常に完了していません</li>
            <li>2. ユーザーが「なし」の場合 → 認証トークンが無効です</li>
            <li>3. メール未確認の場合 → メール確認が必要かもしれません</li>
            <li>4. 「ダッシュボードに強制移動」でアクセスを試してください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}