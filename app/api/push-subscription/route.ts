import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// プッシュ通知の購読情報を保存
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await request.json()

    // データベースに購読情報を保存
    // 実際の実装では、購読情報を保存するテーブルが必要
    /*
    await prisma.pushSubscription.upsert({
      where: { userId: user.id },
      update: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    })
    */

    console.log('Push subscription saved for user:', user.id)
    console.log('Subscription:', subscription)

    return NextResponse.json({
      success: true,
      message: 'プッシュ通知の購読が完了しました',
    })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// プッシュ通知の購読を削除
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // データベースから購読情報を削除
    /*
    await prisma.pushSubscription.delete({
      where: { userId: user.id },
    })
    */

    console.log('Push subscription deleted for user:', user.id)

    return NextResponse.json({
      success: true,
      message: 'プッシュ通知の購読を解除しました',
    })
  } catch (error) {
    console.error('Error deleting push subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
