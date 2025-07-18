'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Crown,
  Zap,
  Check,
  Sparkles,
  MessageCircle,
  BarChart3,
  Users,
  Palette,
  Star,
} from 'lucide-react'
import { getPlansComparison, type SubscriptionPlan } from '@/lib/stripe'

interface UserSubscription {
  plan: SubscriptionPlan
  status: string
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export default function SubscriptionPage() {
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const plans = getPlansComparison()

  useEffect(() => {
    fetchUserSubscription()
  }, [])

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setUserSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    }
  }

  const handleSubscribe = async (planId: SubscriptionPlan) => {
    if (planId === 'free') return

    setLoading(planId)
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.url
      } else {
        throw new Error('チェックアウトの作成に失敗しました')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
    }
  }

  const getPlanIcon = (planId: SubscriptionPlan) => {
    switch (planId) {
      case 'free':
        return <Users className="h-8 w-8 text-gray-600" />
      case 'premium':
        return <Crown className="h-8 w-8 text-blue-600" />
      case 'pro':
        return <Sparkles className="h-8 w-8 text-purple-600" />
      default:
        return <Users className="h-8 w-8" />
    }
  }

  const getPlanColor = (planId: SubscriptionPlan) => {
    switch (planId) {
      case 'free':
        return 'border-gray-200 bg-white'
      case 'premium':
        return 'border-blue-200 bg-blue-50 ring-2 ring-blue-500'
      case 'pro':
        return 'border-purple-200 bg-purple-50 ring-2 ring-purple-500'
      default:
        return 'border-gray-200'
    }
  }

  const getButtonVariant = (planId: SubscriptionPlan) => {
    if (userSubscription?.plan === planId) {
      return 'outline'
    }
    switch (planId) {
      case 'free':
        return 'outline' as const
      case 'premium':
        return 'default' as const
      case 'pro':
        return 'default' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* ヘッダー */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          サブスクリプションプラン
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          あなたのフィットネス目標に合わせて最適なプランを選択してください
        </p>
      </div>

      {/* 現在のプラン */}
      {userSubscription && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              現在のプラン
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {plans.find((p) => p.id === userSubscription.plan)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  ステータス:{' '}
                  <Badge variant="secondary">{userSubscription.status}</Badge>
                </p>
                {userSubscription.currentPeriodEnd && (
                  <p className="text-sm text-gray-600">
                    次回更新:{' '}
                    {userSubscription.currentPeriodEnd.toLocaleDateString(
                      'ja-JP',
                    )}
                  </p>
                )}
              </div>
              {userSubscription.plan !== 'free' && (
                <Button onClick={handleManageSubscription} variant="outline">
                  プラン管理
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* プラン比較 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${getPlanColor(plan.id)} transition-all hover:shadow-lg`}
          >
            {plan.id === 'premium' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  人気
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price === 0 ? (
                  '無料'
                ) : (
                  <>
                    ¥{plan.price.toLocaleString()}
                    <span className="text-lg font-normal text-gray-600">
                      /月
                    </span>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>AIチャット</span>
                  <span className="font-medium">
                    {plan.limitations.aiChats === Infinity
                      ? '無制限'
                      : `月${plan.limitations.aiChats}回`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>分析機能</span>
                  <span className="font-medium capitalize">
                    {plan.limitations.analytics}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>ユーザー間メッセージ</span>
                  <span className="font-medium">
                    {plan.limitations.messaging ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>AIキャラクター選択</span>
                  <span className="font-medium">
                    {plan.limitations.characterSelection ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full"
                  variant={getButtonVariant(plan.id)}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={
                    loading === plan.id || userSubscription?.plan === plan.id
                  }
                >
                  {loading === plan.id
                    ? '処理中...'
                    : userSubscription?.plan === plan.id
                      ? '現在のプラン'
                      : plan.id === 'free'
                        ? '無料で始める'
                        : `${plan.name}にアップグレード`}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* プレミアム機能紹介 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">プレミアム機能でもっと楽しく！</h2>
          <p className="text-xl opacity-90">
            AIキャラクターと一緒にフィットネスライフを向上させましょう
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="text-center space-y-2">
            <Palette className="h-12 w-12 mx-auto opacity-90" />
            <h3 className="font-semibold">AIキャラクター</h3>
            <p className="text-sm opacity-75">可愛いキャラクターから選択</p>
          </div>
          <div className="text-center space-y-2">
            <MessageCircle className="h-12 w-12 mx-auto opacity-90" />
            <h3 className="font-semibold">無制限チャット</h3>
            <p className="text-sm opacity-75">いつでもAIアドバイス</p>
          </div>
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 mx-auto opacity-90" />
            <h3 className="font-semibold">詳細分析</h3>
            <p className="text-sm opacity-75">プロレベルの分析機能</p>
          </div>
          <div className="text-center space-y-2">
            <Users className="h-12 w-12 mx-auto opacity-90" />
            <h3 className="font-semibold">メンバー交流</h3>
            <p className="text-sm opacity-75">ユーザー間メッセージ</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>よくある質問</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">
              いつでもプランを変更できますか？
            </h4>
            <p className="text-sm text-gray-600">
              はい、いつでもプランのアップグレードやダウングレードが可能です。変更は次回の請求サイクルから適用されます。
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">無料トライアルはありますか？</h4>
            <p className="text-sm text-gray-600">
              プレミアムプランには7日間の無料トライアルがあります。トライアル期間中はいつでもキャンセル可能です。
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">
              支払い方法は何が利用できますか？
            </h4>
            <p className="text-sm text-gray-600">
              クレジットカード（Visa、Mastercard、JCB、American
              Express）がご利用いただけます。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
