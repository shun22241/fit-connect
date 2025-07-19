'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionTestPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkSession()
    
    // リアルタイムでセッション変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session)
      checkSession()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      // クライアントサイドのセッション
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // サーバーサイドのセッション確認
      const serverResponse = await fetch('/api/auth/session')
      const serverSession = await serverResponse.json()
      
      // ローカルストレージの確認
      const localStorage = window.localStorage
      const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'))
      const supabaseData: any = {}
      supabaseKeys.forEach(key => {
        try {
          supabaseData[key] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch {
          supabaseData[key] = localStorage.getItem(key)
        }
      })
      
      setSessionInfo({
        client: {
          hasSession: !!session,
          user: session?.user,
          accessToken: session?.access_token ? '存在' : 'なし',
          refreshToken: session?.refresh_token ? '存在' : 'なし',
          expiresAt: session?.expires_at,
          error: sessionError?.message
        },
        server: serverSession,
        localStorage: supabaseData,
        cookies: document.cookie.split(';').filter(c => c.includes('supabase'))
      })
    } catch (error) {
      console.error('Session check error:', error)
      setSessionInfo({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })
      
      console.log('Login result:', { data, error })
      setTimeout(checkSession, 1000) // 1秒後に再チェック
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSession = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    setTimeout(checkSession, 500)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">セッション診断ツール</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">操作</h2>
            <div className="space-y-3">
              <button
                onClick={checkSession}
                disabled={loading}
                className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                🔄 セッション再チェック
              </button>
              <button
                onClick={testLogin}
                disabled={loading}
                className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                🔐 テストログイン
              </button>
              <button
                onClick={clearSession}
                className="w-full p-3 bg-red-500 text-white rounded hover:bg-red-600"
              >
                🧹 セッションクリア
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">セッション状態</h2>
            {sessionInfo && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">クライアント側:</h3>
                  <div className={`p-2 rounded ${sessionInfo.client?.hasSession ? 'bg-green-100' : 'bg-red-100'}`}>
                    {sessionInfo.client?.hasSession ? '✅ セッションあり' : '❌ セッションなし'}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">サーバー側:</h3>
                  <div className={`p-2 rounded ${sessionInfo.server?.hasSession ? 'bg-green-100' : 'bg-red-100'}`}>
                    {sessionInfo.server?.hasSession ? '✅ セッションあり' : '❌ セッションなし'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {sessionInfo && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">詳細情報</h2>
            <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded max-h-96">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 セッション問題の解決方法</h3>
          <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
            <li>ブラウザのCookieが有効になっているか確認</li>
            <li>localStorage/sessionStorageがブロックされていないか確認</li>
            <li>Supabase URLとANON KEYが正しく設定されているか確認</li>
            <li>ミドルウェアがセッションを正しく処理しているか確認</li>
            <li>開発サーバーを再起動して環境変数を再読み込み</li>
          </ol>
        </div>
      </div>
    </div>
  )
}