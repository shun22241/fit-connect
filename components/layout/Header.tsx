'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/supabase-js'
import MobileNavigation from './MobileNavigation'
import { Dumbbell } from 'lucide-react'

interface HeaderProps {
  user: User | null
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* デスクトップヘッダー */}
      <header className="hidden md:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-gray-900"
            >
              <Dumbbell className="h-6 w-6 text-blue-600 mr-2" />
              FitConnect
            </Link>

            <nav className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    href="/workouts"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    ワークアウト
                  </Link>
                  <Link
                    href="/feed"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    フィード
                  </Link>
                  <Link
                    href="/analytics"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    分析
                  </Link>
                  <Link
                    href="/ai-chat"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    AIチャット
                  </Link>
                  <Link
                    href="/messages"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    メッセージ
                  </Link>
                  <Link
                    href="/subscription"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    プラン
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    プロフィール
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/demo">
                    <Button variant="ghost" size="sm">
                      デモ
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      ログイン
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">新規登録</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* モバイルナビゲーション */}
      <MobileNavigation user={user} onSignOut={handleSignOut} />
    </>
  )
}
