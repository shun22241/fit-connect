'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 ログイン開始:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('📊 ログイン結果:', {
        user: data.user ? 'あり' : 'なし',
        session: data.session ? 'あり' : 'なし',
        error: error?.message,
      })

      if (error) throw error

      if (data.user && data.session) {
        console.log('✅ ログイン成功 - セッションを確認中...')

        // セッションが確実に保存されるまで待つ
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // セッションが正しく設定されたか確認
        const sessionCheck = await fetch('/api/auth/session')
        const sessionData = await sessionCheck.json()

        console.log('🔍 セッション確認結果:', sessionData)

        if (sessionData.hasSession) {
          console.log('✅ セッション確認完了 - ダッシュボードへリダイレクト')
          // ページ全体をリロードしてセッションを確実に更新
          window.location.href = '/dashboard'
        } else {
          console.error('❌ セッションが保存されていません')
          setError('セッションの保存に失敗しました。もう一度お試しください。')
        }
      } else {
        console.warn('⚠️ ログイン成功したがユーザーまたはセッションがない')
        setError('ログインに成功しましたが、セッションが作成されませんでした。')
      }
    } catch (error: any) {
      console.error('❌ ログインエラー:', error)
      setError(error.message || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ログイン
          </CardTitle>
          <CardDescription className="text-center">
            FitConnectにログインしてワークアウトを記録しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <p className="text-center text-sm text-gray-600 w-full">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              新規登録
            </Link>
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="w-full text-center">
              <Link
                href="/auth-debug"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                🔍 認証デバッグツール
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
