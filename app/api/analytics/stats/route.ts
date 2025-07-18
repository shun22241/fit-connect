import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'week'
    const metric = searchParams.get('metric') || 'all'

    // デモ環境では認証をスキップ

    let workoutStats = {}

    try {
      if (user) {
        // 実際のワークアウトデータを取得
        const workouts = await prisma.workout.findMany({
          where: {
            userId: user.id,
            createdAt: {
              gte: getTimeframeDate(timeframe),
            },
          },
          include: {
            exercises: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        workoutStats = calculateWorkoutStats(workouts, timeframe)
      } else {
        // ユーザーがいない場合はモックデータを返す
        workoutStats = getMockWorkoutStats(timeframe)
      }
    } catch (dbError) {
      console.log('Database not available, using mock data')
      workoutStats = getMockWorkoutStats(timeframe)
    }

    return NextResponse.json({
      success: true,
      stats: workoutStats,
      timeframe,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Analytics stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Analytics data could not be retrieved' },
      { status: 500 },
    )
  }
}

function getTimeframeDate(timeframe: string): Date {
  const now = new Date()
  switch (timeframe) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case 'quarter':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
}

function calculateWorkoutStats(workouts: any[], timeframe: string) {
  const totalWorkouts = workouts.length
  const totalVolume = workouts.reduce((sum, workout) => {
    return (
      sum +
      workout.exercises.reduce((exerciseSum: number, exercise: any) => {
        const totalWeight =
          exercise.weights?.reduce(
            (weightSum: number, weight: number, index: number) => {
              return (
                weightSum +
                weight * (exercise.reps?.[index] || 0) * exercise.sets
              )
            },
            0,
          ) || 0
        return exerciseSum + totalWeight
      }, 0)
    )
  }, 0)

  const totalDuration = workouts.reduce(
    (sum, workout) => sum + (workout.duration || 0),
    0,
  )
  const averageDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

  // 部位別分布の計算
  const muscleGroups: { [key: string]: number } = {}
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise: any) => {
      const muscleGroup = getMuscleGroup(exercise.name)
      muscleGroups[muscleGroup] = (muscleGroups[muscleGroup] || 0) + 1
    })
  })

  // 週間進捗データの生成
  const weeklyData = generateWeeklyData(workouts)

  // 月間ボリュームデータの生成
  const monthlyData = generateMonthlyData(workouts)

  return {
    summary: {
      totalWorkouts,
      totalVolume,
      totalDuration,
      averageDuration,
      consistency: calculateConsistency(workouts, timeframe),
    },
    weeklyProgress: weeklyData,
    monthlyVolume: monthlyData,
    muscleGroupDistribution: muscleGroups,
    personalRecords: calculatePersonalRecords(workouts),
  }
}

function getMuscleGroup(exerciseName: string): string {
  const chest = [
    'ベンチプレス',
    'インクライン',
    'ダンベルプレス',
    'プッシュアップ',
    'チェストフライ',
  ]
  const back = [
    'デッドリフト',
    'ローイング',
    'プルアップ',
    '懸垂',
    'ラットプルダウン',
  ]
  const legs = [
    'スクワット',
    'レッグプレス',
    'ランジ',
    'レッグカール',
    'カーフレイズ',
  ]
  const shoulders = [
    'ショルダープレス',
    'サイドレイズ',
    'リアレイズ',
    'アップライトロウ',
  ]
  const arms = ['カール', 'エクステンション', 'ディップス', 'クローズグリップ']

  if (chest.some((keyword) => exerciseName.includes(keyword))) return '胸'
  if (back.some((keyword) => exerciseName.includes(keyword))) return '背中'
  if (legs.some((keyword) => exerciseName.includes(keyword))) return '脚'
  if (shoulders.some((keyword) => exerciseName.includes(keyword))) return '肩'
  if (arms.some((keyword) => exerciseName.includes(keyword))) return '腕'

  return 'その他'
}

function calculateConsistency(workouts: any[], timeframe: string): number {
  if (workouts.length === 0) return 0

  const expectedWorkouts =
    timeframe === 'week' ? 3 : timeframe === 'month' ? 12 : 4
  return Math.min(workouts.length / expectedWorkouts, 1)
}

function generateWeeklyData(workouts: any[]) {
  const weekdays = ['月', '火', '水', '木', '金', '土', '日']
  const weeklyVolume = new Array(7).fill(0)
  const weeklyDuration = new Array(7).fill(0)

  workouts.forEach((workout) => {
    const dayOfWeek = new Date(workout.createdAt).getDay()
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust Sunday to be last

    const volume = workout.exercises.reduce((sum: number, exercise: any) => {
      const totalWeight =
        exercise.weights?.reduce(
          (weightSum: number, weight: number, index: number) => {
            return (
              weightSum + weight * (exercise.reps?.[index] || 0) * exercise.sets
            )
          },
          0,
        ) || 0
      return sum + totalWeight
    }, 0)

    weeklyVolume[adjustedDay] += volume
    weeklyDuration[adjustedDay] += workout.duration || 0
  })

  return {
    labels: weekdays,
    volume: weeklyVolume,
    duration: weeklyDuration,
  }
}

function generateMonthlyData(workouts: any[]) {
  const monthlyVolume = [0, 0, 0, 0]

  workouts.forEach((workout) => {
    const weekOfMonth = Math.floor(
      (new Date(workout.createdAt).getDate() - 1) / 7,
    )
    const validWeek = Math.min(weekOfMonth, 3)

    const volume = workout.exercises.reduce((sum: number, exercise: any) => {
      const totalWeight =
        exercise.weights?.reduce(
          (weightSum: number, weight: number, index: number) => {
            return (
              weightSum + weight * (exercise.reps?.[index] || 0) * exercise.sets
            )
          },
          0,
        ) || 0
      return sum + totalWeight
    }, 0)

    monthlyVolume[validWeek] += volume
  })

  return monthlyVolume
}

function calculatePersonalRecords(workouts: any[]) {
  const records: { [key: string]: { weight: number; date: string } } = {}

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise: any) => {
      const maxWeight = Math.max(...(exercise.weights || [0]))
      if (maxWeight > 0) {
        if (
          !records[exercise.name] ||
          maxWeight > records[exercise.name].weight
        ) {
          records[exercise.name] = {
            weight: maxWeight,
            date: workout.createdAt,
          }
        }
      }
    })
  })

  return records
}

function getMockWorkoutStats(timeframe: string) {
  return {
    summary: {
      totalWorkouts: 12,
      totalVolume: 42500,
      totalDuration: 800,
      averageDuration: 67,
      consistency: 0.85,
    },
    weeklyProgress: {
      labels: ['月', '火', '水', '木', '金', '土', '日'],
      volume: [2450, 0, 3200, 0, 2800, 4100, 2950],
      duration: [65, 0, 75, 0, 60, 80, 70],
    },
    monthlyVolume: [8650, 9200, 11300, 10450],
    muscleGroupDistribution: {
      胸: 25,
      背中: 22,
      脚: 20,
      肩: 15,
      腕: 12,
      その他: 6,
    },
    personalRecords: {
      ベンチプレス: { weight: 90, date: '2025-01-15' },
      スクワット: { weight: 110, date: '2025-01-12' },
      デッドリフト: { weight: 125, date: '2025-01-08' },
    },
  }
}
