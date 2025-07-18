import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_demo',
  {
    apiVersion: '2025-06-30.basil',
  },
)

// サブスクリプションプラン
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'フリープラン',
    price: 0,
    priceId: null,
    features: [
      'ワークアウト記録',
      '基本的な分析',
      'コミュニティ参加',
      '月5回のAIアドバイス',
    ],
    limitations: {
      aiChats: 5,
      analytics: 'basic',
      messaging: false,
      characterSelection: false,
    },
  },
  premium: {
    name: 'プレミアムプラン',
    price: 980,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    features: [
      'すべてのフリー機能',
      '詳細分析・レポート',
      'AIキャラクター選択',
      '無制限AIチャット',
      'ユーザー間メッセージ',
      'パーソナルコーチング',
      '優先サポート',
    ],
    limitations: {
      aiChats: Infinity,
      analytics: 'advanced',
      messaging: true,
      characterSelection: true,
    },
  },
  pro: {
    name: 'プロプラン',
    price: 1980,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    features: [
      'すべてのプレミアム機能',
      'カスタムワークアウトプラン',
      '栄養管理アドバイス',
      'ライブコーチングセッション',
      '専用AIトレーナー',
      '競技大会情報',
      '特別イベント参加権',
    ],
    limitations: {
      aiChats: Infinity,
      analytics: 'professional',
      messaging: true,
      characterSelection: true,
      customPlans: true,
      liveCoaching: true,
    },
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// ユーザーのサブスクリプション状態を確認
export async function getUserSubscription(userId: string) {
  try {
    // 実際のアプリではデータベースから取得
    // const subscription = await prisma.userSubscription.findUnique({
    //   where: { userId }
    // })

    // デモ用のフォールバック
    return {
      plan: 'free' as SubscriptionPlan,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    }
  } catch (error) {
    console.error('Get subscription error:', error)
    return {
      plan: 'free' as SubscriptionPlan,
      status: 'inactive',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    }
  }
}

// チェックアウトセッションを作成
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: undefined, // ここで顧客メールを設定
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
    })

    return session
  } catch (error) {
    console.error('Create checkout session error:', error)
    throw new Error('チェックアウトセッションの作成に失敗しました')
  }
}

// カスタマーポータルセッションを作成
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  } catch (error) {
    console.error('Create portal session error:', error)
    throw new Error('カスタマーポータルの作成に失敗しました')
  }
}

// プラン制限チェック
export function checkPlanLimits(
  plan: SubscriptionPlan,
  feature: keyof typeof SUBSCRIPTION_PLANS.free.limitations,
) {
  return SUBSCRIPTION_PLANS[plan].limitations[feature]
}

// プラン比較データ
export function getPlansComparison() {
  return Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
    id: key as SubscriptionPlan,
    ...plan,
  }))
}
