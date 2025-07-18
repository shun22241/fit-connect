import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 },
      )
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: id,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json(
        { success: false, error: 'Already liked' },
        { status: 400 },
      )
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        userId: user.id,
        postId: id,
      },
    })

    return NextResponse.json({ success: true, data: like }, { status: 201 })
  } catch (error) {
    console.error('Error creating like:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Delete like
    const deletedLike = await prisma.like.deleteMany({
      where: {
        userId: user.id,
        postId: id,
      },
    })

    if (deletedLike.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Like not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, message: 'Like removed' })
  } catch (error) {
    console.error('Error deleting like:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
