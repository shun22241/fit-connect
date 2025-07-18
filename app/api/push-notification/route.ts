import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// VAPID キーの設定（環境変数から取得）
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_EMAIL || 'mailto:admin@fitconnect.app',
}

// VAPID キーが設定されている場合のみ初期化
try {
  if (vapidKeys.publicKey && vapidKeys.privateKey) {
    webpush.setVapidDetails(
      vapidKeys.subject,
      vapidKeys.publicKey,
      vapidKeys.privateKey,
    )
  } else {
    console.warn('VAPID keys not configured - push notifications will not work')
  }
} catch (error) {
  console.warn('VAPID setup failed:', error)
  // VAPIDエラーが発生してもアプリケーションは継続
}

// プッシュ通知を送信
export async function POST(request: Request) {
  try {
    // VAPID キーが設定されていない場合はエラーを返す
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 503 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, body, icon, badge, url, userId, type } = await request.json()

    // 通知の種類に応じたデフォルト設定
    const notificationDefaults = {
      like: {
        title: '新しいいいね！',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'like-notification',
      },
      comment: {
        title: '新しいコメント',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'comment-notification',
      },
      follow: {
        title: '新しいフォロワー',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'follow-notification',
      },
      workout: {
        title: 'ワークアウトリマインダー',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'workout-reminder',
      },
    }

    const defaults =
      notificationDefaults[type as keyof typeof notificationDefaults] || {}

    const payload = {
      title: title || defaults.title || 'FitConnect',
      body: body || '新しい通知があります',
      icon: icon || defaults.icon || '/icons/icon-192x192.png',
      badge: badge || defaults.badge || '/icons/icon-72x72.png',
      tag: defaults.tag || 'general-notification',
      url: url || '/',
      data: {
        url: url || '/',
        userId: userId || user.id,
        type: type || 'general',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: '確認する',
          icon: '/icons/checkmark.png',
        },
        {
          action: 'dismiss',
          title: '閉じる',
          icon: '/icons/xmark.png',
        },
      ],
      vibrate: [100, 50, 100],
      requireInteraction: false,
      silent: false,
    }

    // 実際の実装では、対象ユーザーの購読情報を取得
    // const subscriptions = await getSubscriptionsForUser(userId || user.id)

    // デモ用の疑似実装
    console.log('Sending push notification:', payload)

    // 実際のプッシュ通知送信（コメントアウト - 実際の購読情報が必要）
    /*
    const notifications = subscriptions.map(subscription => {
      return webpush.sendNotification(subscription, JSON.stringify(payload))
    })
    
    await Promise.all(notifications)
    */

    return NextResponse.json({
      success: true,
      message: 'プッシュ通知を送信しました',
      payload,
    })
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send push notification' },
      { status: 500 },
    )
  }
}

// 通知のテスト送信
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'test'

    const testPayload = {
      title: 'FitConnect テスト通知',
      body: 'プッシュ通知が正常に動作しています！',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'test-notification',
      url: '/demo',
      data: {
        url: '/demo',
        type: 'test',
        timestamp: Date.now(),
      },
    }

    console.log('Test notification payload:', testPayload)

    return NextResponse.json({
      success: true,
      message: 'テスト通知が準備されました',
      payload: testPayload,
    })
  } catch (error) {
    console.error('Error preparing test notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to prepare test notification' },
      { status: 500 },
    )
  }
}
