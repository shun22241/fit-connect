'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function VercelDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      // 1. 環境変数チェック
      const envResponse = await fetch('/api/debug/env')
      const envData = await envResponse.json()

      // 2. クライアント側の環境変数
      const clientEnv = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      }

      // 3. Supabaseクライアントの状態
      let supabaseStatus = 'unknown'
      let authStatus = null
      try {
        const supabase = createClient()
        supabaseStatus = 'created'

        const { data, error } = await supabase.auth.getSession()
        authStatus = {
          hasSession: !!data.session,
          error: error?.message,
        }
      } catch (error: any) {
        supabaseStatus = `error: ${error.message}`
      }

      // 4. 現在のURL情報
      const urlInfo = {
        href: window.location.href,
        origin: window.location.origin,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
      }

      setDebugInfo({
        environment: envData,
        client: clientEnv,
        supabase: {
          status: supabaseStatus,
          auth: authStatus,
        },
        url: urlInfo,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      setDebugInfo({
        error: error.message,
        stack: error.stack,
      })
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseConnection = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('test').select('*').limit(1)

      alert(
        error ? `Supabase接続エラー: ${error.message}` : 'Supabase接続成功！',
      )
    } catch (error: any) {
      alert(`エラー: ${error.message}`)
    }
  }

  if (loading) {
    return <div className="p-8">診断中...</div>
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Vercel環境診断ツール</h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Vercel環境の問題を診断
          </h2>
          <p className="text-yellow-700 text-sm">
            このページはVercel環境での認証問題を特定するためのツールです。
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={runDiagnostics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 再診断
          </button>
          <button
            onClick={testSupabaseConnection}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
          >
            🔌 Supabase接続テスト
          </button>
          <button
            onClick={async () => {
              const res = await fetch('/api/debug/cookies')
              const data = await res.json()
              console.log('Cookie情報:', data)
              alert('Cookie情報をコンソールに出力しました（F12で確認）')
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 ml-2"
          >
            🍪 Cookie状態確認
          </button>
        </div>

        {debugInfo && (
          <div className="space-y-6">
            {/* 環境変数の状態 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">環境変数の状態</h2>
              <div className="space-y-2">
                <div
                  className={`p-2 rounded ${debugInfo.environment?.supabase?.url?.exists ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  Supabase URL:{' '}
                  {debugInfo.environment?.supabase?.url?.exists
                    ? '✅ 設定済み'
                    : '❌ 未設定'}
                </div>
                <div
                  className={`p-2 rounded ${debugInfo.environment?.supabase?.anonKey?.exists ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  Supabase Anon Key:{' '}
                  {debugInfo.environment?.supabase?.anonKey?.exists
                    ? '✅ 設定済み'
                    : '❌ 未設定'}
                </div>
                <div
                  className={`p-2 rounded ${debugInfo.environment?.vercel?.env ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  Vercel環境: {debugInfo.environment?.vercel?.env || '不明'}
                </div>
              </div>
            </div>

            {/* Supabaseクライアントの状態 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Supabaseクライアント
              </h2>
              <div className="space-y-2">
                <div
                  className={`p-2 rounded ${debugInfo.supabase?.status === 'created' ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  ステータス: {debugInfo.supabase?.status}
                </div>
                {debugInfo.supabase?.auth && (
                  <div
                    className={`p-2 rounded ${debugInfo.supabase.auth.hasSession ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    セッション:{' '}
                    {debugInfo.supabase.auth.hasSession ? 'あり' : 'なし'}
                  </div>
                )}
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">詳細情報</h2>
              <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>

            {/* 解決方法 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                💡 Vercel環境での設定確認
              </h3>
              <ol className="text-blue-700 text-sm space-y-2 list-decimal list-inside">
                <li>Vercelダッシュボード → Settings → Environment Variables</li>
                <li>
                  以下の環境変数が設定されているか確認：
                  <ul className="ml-6 mt-1 list-disc list-inside">
                    <li>NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                    <li>SUPABASE_SERVICE_ROLE_KEY</li>
                  </ul>
                </li>
                <li>
                  Supabaseダッシュボード → Authentication → URL Configuration：
                  <ul className="ml-6 mt-1 list-disc list-inside">
                    <li>Site URL: VercelのデプロイURL</li>
                    <li>Redirect URLs: VercelのURL + /auth/callback</li>
                  </ul>
                </li>
                <li>変更後は必ずVercelを再デプロイ</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
