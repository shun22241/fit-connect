'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Edit2,
  Users,
  Activity,
  TrendingUp,
  Settings,
  Bell,
} from 'lucide-react'
import Link from 'next/link'
import { PostCard } from '@/components/posts/PostCard'

interface UserProfile {
  id: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  email: string
  _count: {
    posts: number
    followers: number
    following: number
    workouts: number
  }
}

interface UserPost {
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
  likes: { userId: string }[]
}

export default function ProfilePage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<UserPost[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchUserPosts()
    }
  }, [user, fetchProfile, fetchUserPosts])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditForm({
          username: data.username || '',
          bio: data.bio || '',
        })
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const response = await fetch('/api/posts?userId=' + user?.id)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('投稿取得エラー:', error)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchProfile()
        setIsEditing(false)
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
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
    return <div>プロフィールが見つかりません</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* プロフィールカード */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">プロフィール</CardTitle>
              <Button
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? '保存' : '編集'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">ユーザー名</label>
                  <Input
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    placeholder="ユーザー名を入力"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">自己紹介</label>
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    placeholder="自己紹介を入力"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile}>保存</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
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

        {/* 設定メニュー */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/settings/notifications">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">プッシュ通知</div>
                      <div className="text-sm text-gray-500">
                        通知設定の管理
                      </div>
                    </div>
                  </div>
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                disabled
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium text-gray-400">
                      プライバシー
                    </div>
                    <div className="text-sm text-gray-400">近日公開</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* タブ */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">投稿</TabsTrigger>
            <TabsTrigger value="workouts">ワークアウト</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
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
                    isLiked: post.likes.some(
                      (like) => like.userId === user?.id,
                    ),
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
