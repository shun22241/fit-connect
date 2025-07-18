import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ログインが必要です' },
        { status: 401 },
      )
    }

    // デモ環境では実際のポータルセッションを作成せず、ダミーURLを返す
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === 'sk_test_demo'
    ) {
      return NextResponse.json({
        success: true,
        url: '/subscription?demo=portal',
        message: 'デモモードです。実際のカスタマーポータルは利用できません。',
      })
    }

    // 実際のアプリでは、ユーザーのStripe Customer IDを取得
    // const customerRecord = await prisma.customer.findUnique({
    //   where: { userId: user.id }
    // })

    const baseUrl = request.headers.get('origin') || 'http://localhost:3000'

    // デモ用のカスタマーID
    const customerId = 'cus_demo_customer'

    const session = await createPortalSession(
      customerId,
      `${baseUrl}/subscription`,
    )

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error('Create portal session error:', error)
    return NextResponse.json(
      { success: false, error: 'カスタマーポータルの作成に失敗しました' },
      { status: 500 },
    )
  }
}
