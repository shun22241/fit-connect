import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, SUBSCRIPTION_PLANS } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    const { planId } = await request.json()

    if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
      return NextResponse.json(
        { success: false, error: '無効なプランが選択されました' },
        { status: 400 },
      )
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]

    if (!plan.priceId) {
      return NextResponse.json(
        { success: false, error: 'このプランは購入できません' },
        { status: 400 },
      )
    }

    // デモ環境では実際のStripeセッションを作成せず、ダミーURLを返す
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === 'sk_test_demo'
    ) {
      return NextResponse.json({
        success: true,
        url: `/subscription/success?plan=${planId}`,
        message: 'デモモードです。実際の決済は行われません。',
      })
    }

    const userId = user?.id || 'demo-user'
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000'

    const session = await createCheckoutSession(
      userId,
      plan.priceId,
      `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/subscription/canceled`,
    )

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json(
      { success: false, error: 'チェックアウトセッションの作成に失敗しました' },
      { status: 500 },
    )
  }
}
