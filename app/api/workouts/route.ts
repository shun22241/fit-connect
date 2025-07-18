import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateWorkoutData } from '@/types/database'

// Demo workouts data
const DEMO_WORKOUTS = [
  {
    id: 'workout-1',
    userId: 'demo-user-1',
    name: '胸・三頭筋トレーニング',
    notes: 'ベンチプレスで新記録を目指しました',
    duration: 75,
    completedAt: new Date('2024-01-15T10:30:00Z'),
    user: {
      id: 'demo-user-1',
      username: 'デモユーザー',
      avatarUrl: null,
    },
    exercises: [
      {
        id: 'exercise-1',
        exerciseName: 'ベンチプレス',
        sets: 4,
        reps: [8, 8, 6, 6],
        weights: [60, 65, 70, 75],
        restSeconds: [90, 90, 120, 120],
        order: 1,
      },
      {
        id: 'exercise-2',
        exerciseName: 'インクラインダンベルプレス',
        sets: 3,
        reps: [10, 10, 8],
        weights: [22, 22, 24],
        restSeconds: [60, 60, 60],
        order: 2,
      },
      {
        id: 'exercise-3',
        exerciseName: 'トライセプスディップス',
        sets: 3,
        reps: [12, 10, 8],
        weights: [0, 0, 0],
        restSeconds: [45, 45, 45],
        order: 3,
      },
    ],
    _count: {
      exercises: 3,
    },
  },
  {
    id: 'workout-2',
    userId: 'demo-user-1',
    name: '背中・二頭筋トレーニング',
    notes: 'デッドリフトで100kg達成！',
    duration: 90,
    completedAt: new Date('2024-01-13T18:20:00Z'),
    user: {
      id: 'demo-user-1',
      username: 'デモユーザー',
      avatarUrl: null,
    },
    exercises: [
      {
        id: 'exercise-4',
        exerciseName: 'デッドリフト',
        sets: 5,
        reps: [5, 5, 3, 3, 1],
        weights: [80, 85, 90, 95, 100],
        restSeconds: [120, 120, 180, 180, 240],
        order: 1,
      },
      {
        id: 'exercise-5',
        exerciseName: 'ラットプルダウン',
        sets: 4,
        reps: [10, 10, 8, 8],
        weights: [50, 52, 55, 55],
        restSeconds: [60, 60, 75, 75],
        order: 2,
      },
      {
        id: 'exercise-6',
        exerciseName: 'バーベルカール',
        sets: 3,
        reps: [12, 10, 8],
        weights: [25, 27, 30],
        restSeconds: [45, 45, 60],
        order: 3,
      },
    ],
    _count: {
      exercises: 3,
    },
  },
  {
    id: 'workout-3',
    userId: 'demo-user-1',
    name: '脚トレーニング',
    notes: 'スクワットとデッドリフトでしっかりと',
    duration: 85,
    completedAt: new Date('2024-01-11T16:00:00Z'),
    user: {
      id: 'demo-user-1',
      username: 'デモユーザー',
      avatarUrl: null,
    },
    exercises: [
      {
        id: 'exercise-7',
        exerciseName: 'スクワット',
        sets: 4,
        reps: [10, 8, 6, 6],
        weights: [70, 75, 80, 85],
        restSeconds: [90, 120, 120, 120],
        order: 1,
      },
      {
        id: 'exercise-8',
        exerciseName: 'レッグプレス',
        sets: 3,
        reps: [15, 12, 10],
        weights: [120, 130, 140],
        restSeconds: [60, 75, 75],
        order: 2,
      },
    ],
    _count: {
      exercises: 2,
    },
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

    // Demo mode: return static demo workouts
    console.log('🏋️ Demo API: Returning demo workouts data')

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredWorkouts = DEMO_WORKOUTS
    if (userId) {
      filteredWorkouts = DEMO_WORKOUTS.filter(
        (workout) => workout.userId === userId,
      )
    }

    const paginatedWorkouts = filteredWorkouts.slice(offset, offset + limit)

    return NextResponse.json({ success: true, data: paginatedWorkouts })
  } catch (error) {
    console.error('Error fetching workouts:', error)
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

    // Demo mode: simulate workout creation
    console.log('🏋️ Demo API: Simulating workout creation')

    const body: CreateWorkoutData = await request.json()

    const newWorkout = {
      id: `workout-${Date.now()}`,
      userId: user.id,
      name: body.name,
      notes: body.notes || null,
      duration: body.duration || null,
      completedAt: new Date(),
      user: {
        id: user.id,
        username: user.user_metadata?.username || 'デモユーザー',
        avatarUrl: null,
      },
      exercises: body.exercises.map((exercise, index) => ({
        id: `exercise-${Date.now()}-${index}`,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        weights: exercise.weights,
        restSeconds: exercise.restSeconds,
        order: index + 1,
      })),
      _count: {
        exercises: body.exercises.length,
      },
    }

    return NextResponse.json(
      { success: true, data: newWorkout },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating workout:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
