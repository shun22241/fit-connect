import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    const { id: followingId } = await params

    if (user.id === followingId) {
      return NextResponse.json(
        { error: '自分自身をフォローすることはできません' },
        { status: 400 },
      )
    }

    // フォロー対象のユーザーが存在するかチェック
    const followingUser = await prisma.user.findUnique({
      where: { id: followingId },
    })

    if (!followingUser) {
      return NextResponse.json(
        { error: 'フォロー対象のユーザーが見つかりません' },
        { status: 404 },
      )
    }

    // 既にフォローしているかチェック
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: '既にフォローしています' },
        { status: 400 },
      )
    }

    // フォロー作成
    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId,
      },
    })

    return NextResponse.json({ message: 'フォローしました' })
  } catch (error) {
    console.error('フォローエラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
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

    const { id: followingId } = await params

    // フォロー関係をチェック
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId,
        },
      },
    })

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'フォローしていません' },
        { status: 400 },
      )
    }

    // フォロー削除
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId,
        },
      },
    })

    return NextResponse.json({ message: 'フォローを解除しました' })
  } catch (error) {
    console.error('フォロー解除エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
