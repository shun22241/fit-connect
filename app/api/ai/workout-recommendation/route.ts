import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWorkoutRecommendation } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    // デモ環境では認証をスキップ
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 認証がない場合はデモモードとして動作

    const { fitnessLevel, goals, equipment, timeAvailable } =
      await request.json()

    // ユーザーの過去のワークアウト履歴を取得（簡略化）
    const previousWorkouts = [
      '胸・三頭筋ワークアウト',
      '背中・二頭筋ワークアウト',
      '脚トレーニング',
    ]

    const userProfile = {
      fitnessLevel: fitnessLevel || 'beginner',
      goals: goals || ['筋力向上'],
      equipment: equipment || ['ダンベル', 'バーベル'],
      timeAvailable: timeAvailable || 45,
      previousWorkouts,
    }

    const recommendation = await generateWorkoutRecommendation(userProfile)

    return NextResponse.json({
      success: true,
      recommendation,
    })
  } catch (error) {
    console.error('AI workout recommendation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate workout recommendation' },
      { status: 500 },
    )
  }
}

// ユーザープロフィールベースの推奨取得
export async function GET(request: Request) {
  try {
    // デモ環境では認証をスキップ
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 認証がない場合はデモモードとして動作

    const { searchParams } = new URL(request.url)
    const quickRecommendation = searchParams.get('quick') === 'true'

    if (quickRecommendation) {
      // 簡易推奨（デフォルト設定）
      const defaultProfile = {
        fitnessLevel: 'intermediate' as const,
        goals: ['筋力向上', '体脂肪減少'],
        equipment: ['ダンベル', 'バーベル', 'ケーブル'],
        timeAvailable: 60,
        previousWorkouts: ['プッシュ', 'プル', 'レッグ'],
      }

      const recommendation = await generateWorkoutRecommendation(defaultProfile)

      return NextResponse.json({
        success: true,
        recommendation,
        type: 'quick',
      })
    }

    // 詳細なプロフィールベースの推奨
    // 実際の実装では、ユーザーのプロフィール情報を取得
    const userProfile = {
      fitnessLevel: 'intermediate' as const,
      goals: ['筋力向上'],
      equipment: ['ダンベル', 'バーベル'],
      timeAvailable: 45,
      previousWorkouts: ['胸トレ', '背中トレ'],
    }

    const recommendation = await generateWorkoutRecommendation(userProfile)

    return NextResponse.json({
      success: true,
      recommendation,
      type: 'personalized',
    })
  } catch (error) {
    console.error('AI workout recommendation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate workout recommendation' },
      { status: 500 },
    )
  }
}
