import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            workouts: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('プロフィール取得エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, bio } = await request.json()

    // ユーザー名の重複チェック
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: user.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'このユーザー名は既に使用されています' },
          { status: 400 },
        )
      }
    }

    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username || null,
        bio: bio || null,
      },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            workouts: true,
          },
        },
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
