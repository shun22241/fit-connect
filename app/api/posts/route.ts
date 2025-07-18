import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreatePostData } from '@/types/database'

// Demo posts data
const DEMO_POSTS = [
  {
    id: 'post-1',
    content:
      '今日は胸と三頭筋をしっかり鍛えました！💪 ベンチプレスで新記録達成 #筋トレ #ベンチプレス #新記録',
    imageUrl: null,
    hashtags: ['筋トレ', 'ベンチプレス', '新記録'],
    createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
    user: {
      id: 'demo-user-1',
      username: 'デモユーザー',
      avatarUrl: null,
      email: 'demo@fitconnect.com',
    },
    workout: {
      id: 'workout-1',
      title: '胸・三頭筋トレーニング',
      totalVolume: 2450,
      duration: 75,
    },
    _count: {
      likes: 12,
      comments: 3,
    },
    isLiked: false,
  },
  {
    id: 'post-2',
    content:
      '朝ランニング完了！今日も気持ちよくスタートできました 🏃‍♂️ #朝ラン #ランニング #健康',
    imageUrl: null,
    hashtags: ['朝ラン', 'ランニング', '健康'],
    createdAt: new Date('2024-01-14T06:45:00Z').toISOString(),
    user: {
      id: 'demo-user-2',
      username: 'ランナー田中',
      avatarUrl: null,
      email: 'runner@fitconnect.com',
    },
    workout: null,
    _count: {
      likes: 8,
      comments: 2,
    },
    isLiked: true,
  },
  {
    id: 'post-3',
    content:
      'デッドリフト100kg達成！ついに3桁の重量を持ち上げることができました！ #デッドリフト #100kg #達成感',
    imageUrl: null,
    hashtags: ['デッドリフト', '100kg', '達成感'],
    createdAt: new Date('2024-01-13T18:20:00Z').toISOString(),
    user: {
      id: 'demo-user-3',
      username: '筋トレ初心者',
      avatarUrl: null,
      email: 'beginner@fitconnect.com',
    },
    workout: {
      id: 'workout-2',
      title: '背中・二頭筋トレーニング',
      totalVolume: 3200,
      duration: 90,
    },
    _count: {
      likes: 25,
      comments: 8,
    },
    isLiked: false,
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Demo mode: return static demo posts
    console.log('📊 Demo API: Returning demo posts data')

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredPosts = DEMO_POSTS
    if (userId) {
      filteredPosts = DEMO_POSTS.filter((post) => post.user.id === userId)
    }

    const paginatedPosts = filteredPosts.slice(offset, offset + limit)

    return NextResponse.json({ success: true, data: paginatedPosts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Demo mode: simulate post creation
    console.log('📊 Demo API: Simulating post creation')

    const body: CreatePostData = await request.json()

    const newPost = {
      id: `post-${Date.now()}`,
      content: body.content,
      imageUrl: body.imageUrl || null,
      hashtags: body.hashtags || [],
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.user_metadata?.username || 'デモユーザー',
        avatarUrl: null,
        email: user.email || 'demo@fitconnect.com',
      },
      workout: null, // For demo, we'll keep it simple
      _count: {
        likes: 0,
        comments: 0,
      },
      isLiked: false,
    }

    return NextResponse.json({ success: true, data: newPost }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
