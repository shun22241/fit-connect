import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCoachingAdvice } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // デモ環境では認証をスキップ

    const { goals, challenges, timeframe } = await request.json()

    // ユーザーのワークアウト履歴を取得（実際の実装）
    let workoutHistory = []
    try {
      const workouts = user
        ? await prisma.workout.findMany({
            where: { userId: user.id },
            include: {
              exercises: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          })
        : []

      workoutHistory = workouts.map((workout) => {
        // Calculate total volume from exercises
        const totalVolume = workout.exercises.reduce((sum, exercise) => {
          const totalWeight = exercise.weights.reduce(
            (weightSum, weight, index) => {
              return weightSum + weight * exercise.reps[index] * exercise.sets
            },
            0,
          )
          return sum + totalWeight
        }, 0)

        return {
          title: workout.name,
          date: workout.createdAt,
          exercises: workout.exercises.length,
          totalVolume,
          duration: workout.duration,
        }
      })
    } catch (error) {
      console.log('Database not available, using mock data')

      // フォールバック: モックデータ
      workoutHistory = [
        {
          title: '胸・三頭筋ワークアウト',
          date: new Date('2025-01-17'),
          exercises: 5,
          totalVolume: 2450,
          duration: 65,
        },
        {
          title: '背中・二頭筋ワークアウト',
          date: new Date('2025-01-15'),
          exercises: 6,
          totalVolume: 3200,
          duration: 75,
        },
        {
          title: '脚トレーニング',
          date: new Date('2025-01-13'),
          exercises: 4,
          totalVolume: 4100,
          duration: 80,
        },
      ]
    }

    const coaching = await generateCoachingAdvice(
      workoutHistory,
      goals || ['筋力向上', '継続'],
      challenges || ['時間不足', 'モチベーション維持'],
    )

    // コーチングアドバイスをデータベースに保存
    /*
    await prisma.coachingSession.create({
      data: {
        userId: user.id,
        goals: JSON.stringify(goals),
        challenges: JSON.stringify(challenges),
        advice: JSON.stringify(coaching),
        timeframe: timeframe || '4weeks'
      }
    })
    */

    return NextResponse.json({
      success: true,
      coaching,
      workoutCount: workoutHistory.length,
      analysisDate: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI coaching error:', error)
    return NextResponse.json(
      { success: false, error: 'コーチングアドバイスの生成に失敗しました' },
      { status: 500 },
    )
  }
}

// 定期的なコーチングチェック
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // デモ環境では認証をスキップ

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'weekly'

    // 週次または月次のコーチングサマリー
    const mockSummary = {
      weekly: {
        workoutsCompleted: 3,
        totalVolume: 9750,
        totalTime: 220,
        consistency: 0.75,
        improvements: [
          'ワークアウト頻度が向上しています',
          '総重量が先週比15%アップ',
        ],
        challenges: [
          '下半身トレーニングの頻度を増やしましょう',
          '休息日も適切に取ることを意識してください',
        ],
      },
      monthly: {
        workoutsCompleted: 12,
        averageIntensity: 7.2,
        goalProgress: 0.68,
        milestones: ['ベンチプレス 80kg達成', '継続14日達成'],
        nextGoals: ['スクワット重量アップ', 'カーディオ要素の追加'],
      },
    }

    const summary =
      mockSummary[type as keyof typeof mockSummary] || mockSummary.weekly

    return NextResponse.json({
      success: true,
      summary,
      type,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Coaching summary error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get coaching summary' },
      { status: 500 },
    )
  }
}
