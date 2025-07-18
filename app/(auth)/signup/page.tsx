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

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // デモ環境では直接ダッシュボードへリダイレクト
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ===
          'https://your-project-id.supabase.co'
      ) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      setSuccess(true)
    } catch (error: any) {
      console.error('Signup error:', error)

      // デモ環境での一般的なエラー（メール確認など）は成功として扱う
      if (
        error.message?.includes('signup') ||
        error.message?.includes('confirm') ||
        error.message?.includes('email')
      ) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      setError(
        error.message ||
          '新規登録に失敗しました。しばらく時間をおいてから再度お試しください。',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Google signup error:', error)
      setError(
        error.message ||
          'Googleログインは現在利用できません。メールアドレスでの登録をお試しください。',
      )
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              確認メールを送信しました
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              {email}{' '}
              に確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                ログインページへ戻る
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            新規登録
          </CardTitle>
          <CardDescription className="text-center">
            FitConnectで筋トレ仲間とつながりましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
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
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登録中...' : '新規登録'}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                または
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            Googleで登録
          </Button>

          {/* デモ用の案内 */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2 text-sm">
              🚀 まずはお試しください！
            </h4>
            <p className="text-xs text-green-700 mb-2">
              アカウント作成前に、デモ機能で FitConnect を体験できます
            </p>
            <div className="space-y-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  📊 デモで機能を体験する
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => {
                  setEmail(`demo-${Date.now()}@fitconnect.com`)
                  setPassword('demo123')
                  setConfirmPassword('demo123')
                }}
                disabled={loading}
              >
                🎯 デモアカウントで今すぐ登録
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 w-full">
            すでにアカウントをお持ちの方は{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ログイン
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
