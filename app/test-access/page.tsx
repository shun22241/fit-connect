'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestAccessPage() {
  const [message, setMessage] = useState('')
  const router = useRouter()

  const testDashboardAccess = () => {
    setMessage('ダッシュボードへのアクセスを試行中...')
    router.push('/dashboard')
  }

  const checkCurrentAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      })
      const data = await response.json()
      setMessage(`認証状態: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setMessage(`エラー: ${error}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">アクセステスト</h1>

        <div className="space-y-4">
          <button
            onClick={testDashboardAccess}
            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            📊 ダッシュボードにアクセス
          </button>

          <button
            onClick={checkCurrentAuth}
            className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            🔍 現在の認証状態を確認
          </button>

          <Link
            href="/auth-debug"
            className="block w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 text-center"
          >
            🛠️ 詳細デバッグツール
          </Link>

          <Link
            href="/login"
            className="block w-full p-3 bg-gray-500 text-white rounded hover:bg-gray-600 text-center"
          >
            🔐 ログインページ
          </Link>
        </div>

        {message && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">結果:</h3>
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
