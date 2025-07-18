import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseNaturalLanguageWorkout } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // デモ環境では認証をスキップ

    const { input, autoSave } = await request.json()

    if (!input || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'ワークアウトの説明を入力してください' },
        { status: 400 },
      )
    }

    const parsedWorkout = await parseNaturalLanguageWorkout(input.trim())

    // 自動保存オプションが有効な場合、ワークアウトを保存
    if (autoSave && parsedWorkout.exercises.length > 0 && user) {
      try {
        // 総重量を計算
        const totalVolume = parsedWorkout.exercises.reduce(
          (total: number, exercise: any) => {
            const weight = exercise.weight || 0
            const sets = exercise.sets || 1
            const reps = exercise.reps || 1
            return total + weight * sets * reps
          },
          0,
        )

        const workout = await prisma.workout.create({
          data: {
            userId: user.id,
            name: parsedWorkout.title,
            notes:
              parsedWorkout.notes ||
              `AI解析により作成: ${input.substring(0, 100)}...`,
            duration: parsedWorkout.total_duration || 30,
            exercises: {
              create: parsedWorkout.exercises.map(
                (exercise: any, index: number) => ({
                  name: exercise.name,
                  sets: exercise.sets || 1,
                  reps: exercise.reps || 1,
                  weight: exercise.weight || null,
                  duration: exercise.duration || null,
                  notes: exercise.notes || null,
                  order: index,
                }),
              ),
            },
          },
          include: {
            exercises: true,
          },
        })

        return NextResponse.json({
          success: true,
          parsed: parsedWorkout,
          saved: true,
          workoutId: workout.id,
          message: 'ワークアウトを解析し、保存しました',
        })
      } catch (dbError) {
        console.log('Database not available, returning parsed data only')

        return NextResponse.json({
          success: true,
          parsed: parsedWorkout,
          saved: false,
          message: 'ワークアウトを解析しました（保存機能はデモ環境では無効）',
        })
      }
    }

    return NextResponse.json({
      success: true,
      parsed: parsedWorkout,
      saved: false,
      message: 'ワークアウトを解析しました',
    })
  } catch (error) {
    console.error('Natural language parsing error:', error)
    return NextResponse.json(
      { success: false, error: '自然言語の解析に失敗しました' },
      { status: 500 },
    )
  }
}

// 解析例を取得
export async function GET() {
  const examples = [
    {
      input:
        '今日は胸トレをしました。ベンチプレス 80kg 10回を3セット、インクラインダンベルプレス 20kg 12回を3セット、プッシュアップ 15回を2セットやりました。',
      description: '胸部トレーニングの記録例',
    },
    {
      input:
        '背中の日。デッドリフト 120kg 5回 4セット、懸垂 自重 8回 3セット、ローイング 60kg 12回 3セット。約1時間。',
      description: '背中トレーニングの記録例',
    },
    {
      input:
        '脚トレ完了！スクワット100kg×8を5セット、レッグプレス150kg×15を4セット、カーフレイズ50kg×20を3セット。90分でした。',
      description: '脚部トレーニングの記録例',
    },
    {
      input:
        '有酸素運動。ランニングマシンで30分、時速8kmで走りました。その後プランク3分を2セット。',
      description: 'カーディオトレーニングの記録例',
    },
    {
      input:
        '肩と腕の日。ショルダープレス40kg 10回×3、サイドレイズ12kg 15回×3、バイセップカール20kg 12回×3、トライセップエクステンション15kg 15回×3。',
      description: '肩・腕トレーニングの記録例',
    },
  ]

  return NextResponse.json({
    success: true,
    examples,
    tips: [
      'エクササイズ名、重量、回数、セット数を含めてください',
      '「kg」「回」「セット」などの単位を明記すると精度が上がります',
      '時間の記載があるとより正確な解析ができます',
      '自重トレーニングの場合は「自重」と記載してください',
    ],
  })
}
