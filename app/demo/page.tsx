'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PostCard } from '@/components/posts/PostCard'
import PWADebugPanel from '@/components/pwa/PWADebugPanel'
import WorkoutRecommendationCard from '@/components/ai/WorkoutRecommendationCard'
import {
  Dumbbell,
  Users,
  Activity,
  TrendingUp,
  MessageCircle,
  Heart,
  User,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'

// モックデータ
const mockPosts = [
  {
    id: '1',
    content:
      '今日は胸と三頭筋のワークアウトを完了！ベンチプレスで新記録達成 💪 #筋トレ #ベンチプレス #胸トレ',
    imageUrl: null,
    hashtags: ['筋トレ', 'ベンチプレス', '胸トレ'],
    createdAt: '2025-01-18T10:00:00Z',
    user: {
      id: 'user1',
      username: 'fitness_taro',
      avatarUrl: null,
      email: 'taro@example.com',
    },
    workout: {
      id: 'workout1',
      title: '胸・三頭筋ワークアウト',
      totalVolume: 2450,
      duration: 65,
    },
    _count: {
      likes: 12,
      comments: 3,
    },
    isLiked: false,
  },
  {
    id: '2',
    content:
      'デッドリフト 120kg × 5 達成！背中がパンパンです 🔥 フォームを意識して丁寧にやりました。 #デッドリフト #背中トレ #重量更新',
    imageUrl: null,
    hashtags: ['デッドリフト', '背中トレ', '重量更新'],
    createdAt: '2025-01-18T08:30:00Z',
    user: {
      id: 'user2',
      username: 'strong_hanako',
      avatarUrl: null,
      email: 'hanako@example.com',
    },
    workout: {
      id: 'workout2',
      title: '背中・二頭筋ワークアウト',
      totalVolume: 3200,
      duration: 75,
    },
    _count: {
      likes: 8,
      comments: 5,
    },
    isLiked: true,
  },
  {
    id: '3',
    content:
      '脚トレ終了！スクワット、レッグプレス、カーフレイズでしっかり追い込みました。明日は歩けるかな？😅',
    imageUrl: null,
    hashtags: ['脚トレ', 'スクワット', 'レッグデイ'],
    createdAt: '2025-01-17T19:45:00Z',
    user: {
      id: 'user3',
      username: 'leg_master',
      avatarUrl: null,
      email: 'master@example.com',
    },
    workout: null,
    _count: {
      likes: 15,
      comments: 7,
    },
    isLiked: false,
  },
]

const features = [
  {
    title: 'ワークアウト記録',
    description: '詳細なエクササイズデータの記録・管理',
    url: '/workouts',
    icon: Dumbbell,
    color: 'blue',
    implemented: true,
  },
  {
    title: 'SNSフィード',
    description: 'ワークアウトを共有し、仲間とつながる',
    url: '/feed',
    icon: Users,
    color: 'green',
    implemented: true,
  },
  {
    title: 'AI ワークアウト推奨',
    description: 'パーソナライズされたワークアウトプラン',
    url: '/workouts/ai-assist',
    icon: CheckCircle,
    color: 'purple',
    implemented: true,
  },
  {
    title: 'フォーム解析',
    description: 'AIによるフォーム改善アドバイス',
    url: '/workouts/ai-assist',
    icon: TrendingUp,
    color: 'green',
    implemented: true,
  },
  {
    title: 'パーソナルコーチ',
    description: 'AIコーチングとモチベーション管理',
    url: '/workouts/ai-assist',
    icon: Heart,
    color: 'red',
    implemented: true,
  },
  {
    title: 'PWA対応',
    description: 'オフライン機能とプッシュ通知',
    url: '#',
    icon: Users,
    color: 'indigo',
    implemented: true,
  },
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                戻る
              </Link>
              <Dumbbell className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">
                FitConnect Demo
              </span>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Phase 3 完成
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                デモフィード
              </h1>
              <p className="text-gray-600">
                実装された機能をご確認いただけます（サンプルデータ）
              </p>
            </div>

            {/* サンプル投稿 */}
            <div className="space-y-6">
              {mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            {/* 機能一覧 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>実装済み機能</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-lg bg-${feature.color}-100 mr-3`}
                          >
                            <IconComponent
                              className={`h-4 w-4 text-${feature.color}-600`}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {feature.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 統計情報 */}
            <Card>
              <CardHeader>
                <CardTitle>プロジェクト統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">実装済みページ</span>
                    <span className="font-semibold">10+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API エンドポイント</span>
                    <span className="font-semibold">15+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">データベーステーブル</span>
                    <span className="font-semibold">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">完成度</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      Phase 3 完成
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PWA デバッグパネル */}
            <PWADebugPanel />

            {/* AI機能デモ */}
            <WorkoutRecommendationCard />
          </div>
        </div>

        {/* 技術スタック */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            技術スタック
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Next.js 15',
              'TypeScript',
              'Tailwind CSS',
              'Prisma',
              'Supabase',
              'shadcn/ui',
            ].map((tech) => (
              <div
                key={tech}
                className="bg-white p-4 rounded-lg shadow-sm text-center"
              >
                <div className="font-medium text-sm">{tech}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                デモ環境について
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>
                  これはデモ環境です。実際のデータベース接続やユーザー認証は無効化されており、サンプルデータを表示しています。実際の機能を利用するには、Supabaseプロジェクトの設定が必要です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
