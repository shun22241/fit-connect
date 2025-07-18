import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeWorkoutForm } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // デモ環境では認証をスキップ

    const { exerciseName, userDescription, videoUrl, issues } =
      await request.json()

    if (!exerciseName || !userDescription) {
      return NextResponse.json(
        { error: 'エクササイズ名と説明は必須です' },
        { status: 400 },
      )
    }

    // 追加情報を含めた詳細な説明を作成
    let fullDescription = userDescription

    if (issues && issues.length > 0) {
      fullDescription += `\n\n気になる点: ${issues.join(', ')}`
    }

    if (videoUrl) {
      fullDescription += `\n\n動画URL: ${videoUrl}`
    }

    const analysis = await analyzeWorkoutForm(exerciseName, fullDescription)

    // 分析結果をデータベースに保存（将来的な改善のため）
    /*
    await prisma.formAnalysis.create({
      data: {
        userId: user.id,
        exerciseName,
        userDescription: fullDescription,
        analysis: JSON.stringify(analysis),
        score: analysis.score,
      }
    })
    */

    return NextResponse.json({
      success: true,
      analysis,
      exercise: exerciseName,
    })
  } catch (error) {
    console.error('AI form analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'フォーム解析に失敗しました' },
      { status: 500 },
    )
  }
}

// 過去の分析履歴を取得
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // デモ環境では認証をスキップ

    const { searchParams } = new URL(request.url)
    const exerciseName = searchParams.get('exercise')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 実際の実装では、データベースから履歴を取得
    const mockHistory = [
      {
        id: '1',
        exerciseName: 'スクワット',
        score: 8,
        createdAt: '2025-01-17T10:00:00Z',
        improvements: ['膝の位置を意識', '重心を後ろに'],
      },
      {
        id: '2',
        exerciseName: 'ベンチプレス',
        score: 7,
        createdAt: '2025-01-16T15:30:00Z',
        improvements: ['肩甲骨を寄せる', 'バーの軌道を意識'],
      },
    ]

    let filteredHistory = mockHistory
    if (exerciseName) {
      filteredHistory = mockHistory.filter((h) =>
        h.exerciseName.toLowerCase().includes(exerciseName.toLowerCase()),
      )
    }

    return NextResponse.json({
      success: true,
      history: filteredHistory.slice(0, limit),
      total: filteredHistory.length,
    })
  } catch (error) {
    console.error('Form analysis history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get form analysis history' },
      { status: 500 },
    )
  }
}
