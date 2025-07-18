'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  Dumbbell,
  Users,
  User,
  Plus,
  Menu,
  X,
  LogOut,
  BarChart3,
  MessageCircle,
  Sparkles,
  Crown,
  Settings,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavigationProps {
  user: any
  onSignOut: () => void
}

const navigationItems = [
  {
    name: 'ホーム',
    href: '/',
    icon: Home,
  },
  {
    name: 'ワークアウト',
    href: '/workouts',
    icon: Dumbbell,
  },
  {
    name: 'フィード',
    href: '/feed',
    icon: Users,
  },
  {
    name: 'AI',
    href: '/ai-chat',
    icon: Sparkles,
  },
  {
    name: 'プロフィール',
    href: '/profile',
    icon: User,
  },
]

const additionalMenuItems = [
  {
    name: '分析',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'メッセージ',
    href: '/messages',
    icon: MessageCircle,
  },
  {
    name: 'プラン',
    href: '/subscription',
    icon: Crown,
  },
  {
    name: '通知設定',
    href: '/settings/notifications',
    icon: Bell,
  },
]

const quickActions = [
  {
    name: '新しいワークアウト',
    href: '/workouts/new',
    icon: Dumbbell,
    color: 'bg-blue-500',
  },
  {
    name: '新しい投稿',
    href: '/posts/new',
    icon: Plus,
    color: 'bg-green-500',
  },
]

export default function MobileNavigation({
  user,
  onSignOut,
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      {/* モバイルヘッダー */}
      <div className="md:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center">
            <Dumbbell className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-bold text-lg">FitConnect</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="p-2"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* モバイルメニューオーバーレイ */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={toggleMenu}
        >
          <div
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Dumbbell className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="font-bold text-lg">メニュー</span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleMenu}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* ユーザー情報 */}
              {user && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.user_metadata?.username || 'ユーザー'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* クイックアクション */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  クイックアクション
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const IconComponent = action.icon
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={toggleMenu}
                        className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{action.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* ナビゲーション */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  ナビゲーション
                </h3>
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={toggleMenu}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50',
                        )}
                      >
                        <IconComponent className="h-5 w-5 mr-3" />
                        {item.name}
                        {isActive && (
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-blue-100 text-blue-600"
                          >
                            現在
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* 追加メニュー */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  その他
                </h3>
                <div className="space-y-1">
                  {additionalMenuItems.map((item) => {
                    const IconComponent = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={toggleMenu}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50',
                        )}
                      >
                        <IconComponent className="h-5 w-5 mr-3" />
                        {item.name}
                        {isActive && (
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-blue-100 text-blue-600"
                          >
                            現在
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* ログアウト */}
              {user && (
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onSignOut()
                      toggleMenu()
                    }}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    ログアウト
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* モバイル底部ナビゲーション */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center space-y-1 transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-t"></div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ボトムナビゲーション用のスペーサー */}
      <div className="md:hidden h-16"></div>
    </>
  )
}
