import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          include: {
            workout: {
              select: {
                id: true,
                name: true,
                duration: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
            likes: {
              where: { userId: user.id },
              select: { userId: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            workouts: true,
          },
        },
        followers: {
          where: { followerId: user.id },
          select: { followerId: true },
        },
      },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 },
      )
    }

    // フォロー状態を判定
    const isFollowing = targetUser.followers.length > 0

    const response = {
      ...targetUser,
      isFollowing,
      posts: targetUser.posts.map((post) => ({
        ...post,
        isLiked: post.likes.length > 0,
        likes: undefined, // フロントエンドに不要な情報を除外
      })),
      followers: undefined, // フロントエンドに不要な情報を除外
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
