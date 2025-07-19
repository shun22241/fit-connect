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
import DebugClient from './debug-client'

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
    console.log('🚀 Starting signup process...')
    console.log('📧 Email:', email)
    console.log('🔒 Password length:', password.length)
    
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      console.error('❌ Password mismatch')
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    try {
      console.log('📡 Calling supabase.auth.signUp...')
      console.log('🌐 Redirect URL:', `${location.origin}/auth/callback`)
      
      const startTime = Date.now()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })
      const endTime = Date.now()
      
      console.log(`⏱️ API call took ${endTime - startTime}ms`)
      console.log('📤 Signup response:', {
        data: data,
        error: error,
        user: data?.user,
        session: data?.session,
      })

      if (error) {
        console.error('❌ Signup error:', error)
        throw error
      }

      if (data?.user) {
        console.log('✅ User created successfully:', data.user.id)
        console.log('📧 User email:', data.user.email)
        console.log('🕐 Created at:', data.user.created_at)
        console.log('✉️ Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No')
      } else {
        console.warn('⚠️ No user data returned')
      }

      setSuccess(true)
    } catch (error: any) {
      console.error('🚨 Signup error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        name: error.name,
        stack: error.stack,
      })
      
      // Handle specific error cases
      let errorMessage = error.message || '新規登録に失敗しました'
      
      if (error.message?.includes('email_provider_disabled')) {
        errorMessage = 'メール認証が無効になっています。管理者にお問い合わせください。'
      } else if (error.message?.includes('email_address_invalid')) {
        errorMessage = 'メールアドレスが無効です。正しいメールアドレスを入力してください。'
      } else if (error.message?.includes('email_address_not_confirmed')) {
        errorMessage = 'メールアドレスが確認されていません。確認メールをチェックしてください。'
      } else if (error.message?.includes('user_already_exists') || error.message?.includes('email_address_in_use')) {
        errorMessage = `このメールアドレスは既に使用されています。\n\nデータの不整合がある場合は、管理ツールでクリーンアップしてください。`
      }
      
      setError(errorMessage)
    } finally {
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
              {email} に確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。
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
      <DebugClient />
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
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <p className="text-center text-sm text-gray-600 w-full">
            すでにアカウントをお持ちの方は{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ログイン
            </Link>
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="w-full text-center space-y-2">
              <Link
                href="/emergency-fix"
                className="block text-sm text-red-600 hover:text-red-800 underline font-medium"
              >
                🚨 緊急修復ツール - データ破損の場合
              </Link>
              <Link
                href="/admin/auth-cleanup"
                className="block text-xs text-gray-600 hover:text-gray-800 underline"
              >
                🔧 通常の認証クリーンアップ
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}