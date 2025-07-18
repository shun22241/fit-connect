import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dumbbell,
  Users,
  Activity,
  TrendingUp,
  MessageCircle,
  Heart,
  User,
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">
                FitConnect
              </span>
            </div>
            <div className="space-x-4">
              <Link href="/login">
                <Button variant="outline">🎯 デモで体験</Button>
              </Link>
              <Link href="/signup">
                <Button>🚀 無料で始める</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ワークアウトを記録し、
            <br />
            仲間とつながる筋トレSNS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            FitConnectは、あなたのフィットネスジャーニーを記録し、
            同じ目標を持つ仲間とつながることができるソーシャルプラットフォームです。
          </p>
          <div className="space-x-4">
            <Link href="/demo">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Activity className="mr-2 h-5 w-5" />
                デモを体験
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                今すぐ始める
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Phase 3 完成機能
            </h2>
            <p className="text-lg text-gray-600">
              SNS投稿機能が実装され、完全なソーシャルフィットネスプラットフォームが完成
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* ワークアウト記録 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dumbbell className="h-6 w-6 text-blue-600 mr-2" />
                  ワークアウト記録
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  詳細なエクササイズデータの記録・管理
                </p>
                <div className="space-y-2">
                  <Badge variant="secondary">セット・レップ・重量記録</Badge>
                  <Badge variant="secondary">総重量・時間計算</Badge>
                  <Badge variant="secondary">進捗追跡</Badge>
                </div>
              </CardContent>
            </Card>

            {/* SNS機能 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  SNS機能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  ワークアウトを共有し、仲間とつながる
                </p>
                <div className="space-y-2">
                  <Badge variant="secondary">投稿・フィード</Badge>
                  <Badge variant="secondary">いいね・コメント</Badge>
                  <Badge variant="secondary">フォロー機能</Badge>
                </div>
              </CardContent>
            </Card>

            {/* プロフィール */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-6 w-6 text-purple-600 mr-2" />
                  プロフィール
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">個人の成果と統計を表示</p>
                <div className="space-y-2">
                  <Badge variant="secondary">投稿履歴</Badge>
                  <Badge variant="secondary">フォロワー統計</Badge>
                  <Badge variant="secondary">プロフィール編集</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              実装済み機能統計
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">10+</div>
              <div className="text-gray-600">実装済みページ</div>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">15+</div>
              <div className="text-gray-600">API エンドポイント</div>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">7</div>
              <div className="text-gray-600">データベーステーブル</div>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-gray-600">Phase 3 完成</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            デモアプリケーションを体験
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            実装された全ての機能をご確認いただけます
          </p>
          <Link href="/demo">
            <Button size="lg" variant="secondary">
              <MessageCircle className="mr-2 h-5 w-5" />
              デモページへ
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-6 w-6 text-blue-400 mr-2" />
            <span className="text-xl font-bold text-white">FitConnect</span>
          </div>
          <p className="text-gray-400">
            © 2025 FitConnect. Next.js 14 + TypeScript + Supabase + Prisma
          </p>
        </div>
      </footer>
    </main>
  )
}
