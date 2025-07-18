'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Activity, TrendingUp, UserPlus, UserMinus } from 'lucide-react'
import { PostCard } from '@/components/posts/PostCard'

interface UserProfile {
  id: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  email: string
  isFollowing: boolean
  _count: {
    posts: number
    followers: number
    following: number
    workouts: number
  }
  posts: Array<{
    id: string
    content: string
    imageUrl: string | null
    hashtags: string[]
    createdAt: string
    workoutId: string | null
    workout: {
      id: string
      title: string
      totalVolume: number
      duration: number
    } | null
    _count: {
      likes: number
      comments: number
    }
    isLiked: boolean
  }>
}

export default function UserProfilePage() {
  const params = useParams()
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  const userId = params.id as string

  useEffect(() => {
    if (user && userId) {
      fetchUserProfile()
    }
  }, [user, userId])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('ユーザー取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!profile || followLoading) return

    setFollowLoading(true)
    try {
      const method = profile.isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
      })

      if (response.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: !prev.isFollowing,
                _count: {
                  ...prev._count,
                  followers: prev.isFollowing
                    ? prev._count.followers - 1
                    : prev._count.followers + 1,
                },
              }
            : null,
        )
      }
    } catch (error) {
      console.error('フォロー操作エラー:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">ユーザーが見つかりません</h1>
        <p className="text-muted-foreground">
          指定されたユーザーは存在しないか、削除されています。
        </p>
      </div>
    )
  }

  const isOwnProfile = user?.id === userId

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* プロフィールカード */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {profile.username || 'ユーザー'}のプロフィール
              </CardTitle>
              {!isOwnProfile && (
                <Button
                  onClick={handleFollow}
                  disabled={followLoading}
                  variant={profile.isFollowing ? 'outline' : 'default'}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      フォロー解除
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      フォロー
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {profile.username || 'ユーザー名未設定'}
                  </h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{profile._count.posts}</div>
              <div className="text-sm text-muted-foreground">投稿</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold">
                {profile._count.workouts}
              </div>
              <div className="text-sm text-muted-foreground">ワークアウト</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">
                {profile._count.followers}
              </div>
              <div className="text-sm text-muted-foreground">フォロワー</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">
                {profile._count.following}
              </div>
              <div className="text-sm text-muted-foreground">フォロー中</div>
            </CardContent>
          </Card>
        </div>

        {/* タブ */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">投稿</TabsTrigger>
            <TabsTrigger value="workouts">ワークアウト</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="space-y-4">
            {profile.posts.length > 0 ? (
              profile.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    content: post.content,
                    imageUrl: post.imageUrl,
                    hashtags: post.hashtags,
                    createdAt: post.createdAt,
                    user: {
                      id: profile.id,
                      username: profile.username,
                      avatarUrl: profile.avatarUrl,
                    },
                    workout: post.workout,
                    _count: post._count,
                    isLiked: post.isLiked,
                  }}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">まだ投稿がありません</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="workouts">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  ワークアウト履歴を表示予定
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
