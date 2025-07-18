import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/stripe'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // デモ環境では認証をスキップ
    const userId = user?.id || 'demo-user'

    const subscription = await getUserSubscription(userId)

    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        currentPeriodEnd: subscription.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd)
          : null,
      },
    })
  } catch (error) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { success: false, error: 'サブスクリプション情報の取得に失敗しました' },
      { status: 500 },
    )
  }
}
