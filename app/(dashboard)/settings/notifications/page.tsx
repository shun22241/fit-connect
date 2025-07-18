'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Bell,
  Settings,
  Smartphone,
  User,
  Heart,
  MessageCircle,
  Trophy,
  Calendar,
} from 'lucide-react'

interface NotificationSettings {
  enabled: boolean
  workoutReminders: boolean
  socialInteractions: boolean
  weeklyProgress: boolean
  achievements: boolean
  messages: boolean
  aiCoaching: boolean
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] =
    useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  )
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    workoutReminders: true,
    socialInteractions: true,
    weeklyProgress: true,
    achievements: true,
    messages: true,
    aiCoaching: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)

      // 既存のサブスクリプションを確認
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub)
          setSettings((prev) => ({ ...prev, enabled: !!sub }))
        })
      })
    }

    // 保存された設定を読み込み
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: '非対応',
        description: 'このブラウザはプッシュ通知をサポートしていません',
        variant: 'destructive',
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === 'granted') {
        await subscribeToPush()
      } else {
        toast({
          title: 'プッシュ通知が無効',
          description:
            '通知を受け取るには、ブラウザの設定で通知を許可してください',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Permission request failed:', error)
      toast({
        title: 'エラー',
        description: '通知の許可リクエストに失敗しました',
        variant: 'destructive',
      })
    }
  }

  const subscribeToPush = async () => {
    if (!isSupported || permission !== 'granted') return

    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready

      // VAPID キー（実際の実装では環境変数から取得）
      const vapidPublicKey =
        'BEl62iUYgUivxIkv69yViEuiBIa40HI2BN4XMiATV2xJyObYCNh80GFE0ZWCbX3m5EMq0A_tH_Cq8oPa-cG1hCo'

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      })

      // サーバーにサブスクリプションを送信
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      setSubscription(subscription)
      setSettings((prev) => ({ ...prev, enabled: true }))

      toast({
        title: 'プッシュ通知を有効化',
        description: 'FitConnectからの通知を受け取る準備ができました',
      })
    } catch (error) {
      console.error('Push subscription failed:', error)
      toast({
        title: 'エラー',
        description: 'プッシュ通知の登録に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    if (!subscription) return

    setLoading(true)
    try {
      await subscription.unsubscribe()

      // サーバーからサブスクリプションを削除
      await fetch('/api/push-subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })

      setSubscription(null)
      setSettings((prev) => ({ ...prev, enabled: false }))

      toast({
        title: 'プッシュ通知を無効化',
        description: 'プッシュ通知が無効になりました',
      })
    } catch (error) {
      console.error('Unsubscribe failed:', error)
      toast({
        title: 'エラー',
        description: 'プッシュ通知の無効化に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings))
  }

  const sendTestNotification = async () => {
    if (!subscription) {
      toast({
        title: 'エラー',
        description: 'プッシュ通知が有効になっていません',
        variant: 'destructive',
      })
      return
    }

    try {
      await fetch('/api/push-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          title: 'FitConnect テスト通知',
          body: 'プッシュ通知が正常に動作しています！🎉',
          icon: '/icons/icon-192x192.png',
        }),
      })

      toast({
        title: 'テスト通知を送信',
        description: '数秒後に通知が表示されます',
      })
    } catch (error) {
      console.error('Test notification failed:', error)
      toast({
        title: 'エラー',
        description: 'テスト通知の送信に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = () => {
    if (!isSupported) {
      return <Badge variant="destructive">非対応</Badge>
    }
    if (permission === 'denied') {
      return <Badge variant="destructive">拒否</Badge>
    }
    if (subscription) {
      return <Badge variant="default">有効</Badge>
    }
    return <Badge variant="secondary">無効</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              プッシュ通知設定
            </h1>
          </div>
          <p className="text-gray-600">
            ワークアウトのリマインダーやソーシャル機能の通知を設定できます
          </p>
        </div>

        <div className="space-y-6">
          {/* 通知の状態 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  プッシュ通知の状態
                </CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription>現在のプッシュ通知の設定状況</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSupported ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">
                    このブラウザはプッシュ通知をサポートしていません
                  </p>
                </div>
              ) : permission === 'denied' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 mb-2">
                    プッシュ通知が拒否されています
                  </p>
                  <p className="text-red-600 text-sm">
                    ブラウザの設定から通知を許可してページを再読み込みしてください
                  </p>
                </div>
              ) : subscription ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 mb-3">
                    プッシュ通知が有効になっています
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={sendTestNotification}>
                      テスト通知を送信
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={unsubscribeFromPush}
                      disabled={loading}
                    >
                      無効にする
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 mb-3">
                    プッシュ通知を有効にして、重要な通知を受け取りましょう
                  </p>
                  <Button onClick={requestPermission} disabled={loading}>
                    {loading ? '設定中...' : 'プッシュ通知を有効にする'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 通知の詳細設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                通知設定
              </CardTitle>
              <CardDescription>
                受け取りたい通知の種類を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ワークアウト関連 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  ワークアウト
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="workout-reminders" className="text-base">
                      ワークアウトリマインダー
                    </Label>
                    <p className="text-sm text-gray-600">
                      定期的にワークアウトを促す通知
                    </p>
                  </div>
                  <Switch
                    id="workout-reminders"
                    checked={settings.workoutReminders}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings('workoutReminders', checked)
                    }
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-progress" className="text-base">
                      週間進捗レポート
                    </Label>
                    <p className="text-sm text-gray-600">
                      週ごとのワークアウト実績をお知らせ
                    </p>
                  </div>
                  <Switch
                    id="weekly-progress"
                    checked={settings.weeklyProgress}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings('weeklyProgress', checked)
                    }
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="achievements" className="text-base">
                      達成バッジ
                    </Label>
                    <p className="text-sm text-gray-600">
                      新しい記録や目標達成時の通知
                    </p>
                  </div>
                  <Switch
                    id="achievements"
                    checked={settings.achievements}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings('achievements', checked)
                    }
                    disabled={!settings.enabled}
                  />
                </div>
              </div>

              <hr />

              {/* ソーシャル関連 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  ソーシャル
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="social-interactions" className="text-base">
                      いいね・コメント
                    </Label>
                    <p className="text-sm text-gray-600">
                      投稿へのいいねやコメントの通知
                    </p>
                  </div>
                  <Switch
                    id="social-interactions"
                    checked={settings.socialInteractions}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings('socialInteractions', checked)
                    }
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="messages" className="text-base">
                      メッセージ
                    </Label>
                    <p className="text-sm text-gray-600">
                      他のユーザーからのメッセージ
                    </p>
                  </div>
                  <Switch
                    id="messages"
                    checked={settings.messages}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings('messages', checked)
                    }
                    disabled={!settings.enabled}
                  />
                </div>
              </div>

              <hr />

              {/* AI関連 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  AIコーチング
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ai-coaching" className="text-base">
                      AIからのアドバイス
                    </Label>
                    <p className="text-sm text-gray-600">
                      AIキャラクターからのワークアウト提案
                    </p>
                  </div>
                  <Switch
                    id="ai-coaching"
                    checked={settings.aiCoaching}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings('aiCoaching', checked)
                    }
                    disabled={!settings.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 使用方法 */}
          <Card>
            <CardHeader>
              <CardTitle>プッシュ通知について</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  • 通知は重要な情報のみ送信され、スパム的な送信は行いません
                </p>
                <p>• いつでも設定から通知を無効にできます</p>
                <p>• オフライン時でも通知を受け取ることができます</p>
                <p>• プライバシーを保護し、個人情報は含まれません</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
