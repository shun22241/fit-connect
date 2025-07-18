import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(
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
    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!workout) {
      return NextResponse.json(
        { success: false, error: 'Workout not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: workout })
  } catch (error) {
    console.error('Error fetching workout:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const { id } = await params

    // Check if user owns the workout
    const existingWorkout = await prisma.workout.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingWorkout || existingWorkout.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const workout = await prisma.workout.update({
      where: { id },
      data: {
        name: body.name,
        notes: body.notes,
        duration: body.duration,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ success: true, data: workout })
  } catch (error) {
    console.error('Error updating workout:', error)
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
    // Check if user owns the workout
    const existingWorkout = await prisma.workout.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingWorkout || existingWorkout.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.workout.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Workout deleted' })
  } catch (error) {
    console.error('Error deleting workout:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
