'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PostCard from '@/components/posts/PostCard'
import PullToRefresh from '@/components/ui/PullToRefresh'
import { usePosts } from '@/hooks/usePosts'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Plus, Users, TrendingUp, Heart } from 'lucide-react'

export default function FeedPage() {
  const { posts, loading, error, refetch } = usePosts()
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">フィードを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">エラーが発生しました: {error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              再読み込み
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleRefresh = async () => {
    // 少し遅延を追加してユーザー体験を向上
    await new Promise((resolve) => setTimeout(resolve, 500))
    await refetch()
  }

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      className="min-h-screen bg-gray-50"
    >
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* メインフィード */}
            <div className="lg:col-span-3 space-y-6">
              {/* ヘッダー */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">フィード</h1>
                  <p className="mt-2 text-gray-600">
                    コミュニティの最新投稿をチェックしましょう
                  </p>
                </div>
                <Link href="/posts/new">
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    投稿する
                  </Button>
                </Link>
              </div>

              {/* 投稿作成プロンプト */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0">
                      <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                        {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <Link href="/posts/new" className="flex-1">
                      <div className="w-full p-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                        今日のワークアウトをシェアしませんか？
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* 投稿リスト */}
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        まだ投稿がありません
                      </h3>
                      <p className="text-gray-600 mb-6">
                        最初の投稿をしてコミュニティを盛り上げましょう！
                      </p>
                      <Link href="/posts/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          最初の投稿をする
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              {/* もっと読み込む */}
              {posts.length > 0 && (
                <div className="text-center">
                  <Button variant="outline">もっと読み込む</Button>
                </div>
              )}
            </div>

            {/* サイドバー */}
            <div className="lg:col-span-1 space-y-6">
              {/* 今日の統計 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">今日の活動</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">新しい投稿</span>
                    </div>
                    <span className="font-semibold">{posts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-gray-600">いいね</span>
                    </div>
                    <span className="font-semibold">
                      {posts.reduce((sum, post) => sum + post._count.likes, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        アクティブユーザー
                      </span>
                    </div>
                    <span className="font-semibold">
                      {new Set(posts.map((post) => post.user.id)).size}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* トレンドハッシュタグ */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    トレンドハッシュタグ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getTopHashtags(posts).map((hashtag, index) => (
                      <div
                        key={hashtag.tag}
                        className="flex items-center justify-between"
                      >
                        <span className="text-blue-600 text-sm">
                          #{hashtag.tag}
                        </span>
                        <span className="text-xs text-gray-500">
                          {hashtag.count}件
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* アクションカード */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Link href="/workouts/new">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        ワークアウトを記録
                      </Button>
                    </Link>
                    <Link href="/posts/new">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        投稿を作成
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        プロフィール
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  )
}

// ヘルパー関数：人気ハッシュタグを取得
function getTopHashtags(posts: any[]) {
  const hashtagCount: Record<string, number> = {}

  posts.forEach((post) => {
    post.hashtags.forEach((tag: string) => {
      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1
    })
  })

  return Object.entries(hashtagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}
