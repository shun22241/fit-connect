'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// ロード中コンポーネント
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
)

const LoadingCard = () => (
  <div className="animate-pulse rounded-lg border p-4">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
)

// ワークアウト関連コンポーネント（重いコンポーネントを遅延読み込み）
export const LazyExerciseForm = dynamic(
  () => import('@/components/workouts/ExerciseForm'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // クライアントサイドでのみ読み込み
  },
)

// PWA関連コンポーネント
export const LazyPWAInstallPrompt = dynamic(
  () => import('@/components/pwa/PWAInstallPrompt'),
  {
    loading: () => null, // プロンプトなので読み込み表示は不要
    ssr: false,
  },
)

export const LazyPWAUpdateNotification = dynamic(
  () => import('@/components/pwa/PWAUpdateNotification'),
  {
    loading: () => null,
    ssr: false,
  },
)

// モーダルやダイアログ（使用時まで遅延）
export const LazyDialog = dynamic(
  () =>
    import('@/components/ui/dialog').then((mod) => ({ default: mod.Dialog })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
)

// 投稿関連コンポーネント
export const LazyPostCard = dynamic(
  () => import('@/components/posts/PostCard'),
  {
    loading: () => <LoadingCard />,
    ssr: true, // SEOのため初期レンダリングに含める
  },
)

// モバイルナビゲーション（モバイルでのみ使用）
export const LazyMobileNavigation = dynamic(
  () => import('@/components/layout/MobileNavigation'),
  {
    loading: () => null,
    ssr: false,
  },
)

// Swipeableカード（タッチジェスチャー）
export const LazySwipeableCard = dynamic(
  () => import('@/components/ui/SwipeableCard'),
  {
    loading: () => <LoadingCard />,
    ssr: false, // タッチジェスチャーはクライアントサイドのみ
  },
)

// チャート系コンポーネント（重いライブラリが必要）
export const LazyChart = dynamic(
  () =>
    Promise.resolve({
      default: () => (
        <div className="rounded-lg border p-4 text-center text-gray-500">
          <p>チャート機能は準備中です</p>
        </div>
      ),
    }),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
)

// AI関連コンポーネント（OpenAI使用時のみ必要）
export const LazyAICoach = dynamic(
  () =>
    Promise.resolve({
      default: () => (
        <div className="rounded-lg border p-4 text-center text-gray-500">
          <p>AI機能は準備中です</p>
        </div>
      ),
    }),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
)

// カメラ関連コンポーネント（カメラアクセス時のみ）
export const LazyCameraCapture = dynamic(
  () =>
    Promise.resolve({
      default: () => (
        <div className="rounded-lg border p-4 text-center text-gray-500">
          <p>カメラ機能は準備中です</p>
        </div>
      ),
    }),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
)

// ページコンポーネント用のレイジーローダー
export function createLazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: () => React.ReactNode
    fallback?: ComponentType
  },
) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <LoadingSpinner />),
    ssr: true,
  })
}

// 特定条件でのみ読み込むコンポーネント
export function createConditionalLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  condition: () => boolean,
  fallback?: ComponentType,
) {
  if (!condition()) {
    return fallback || (() => null)
  }

  return dynamic(importFn, {
    loading: () => <LoadingSpinner />,
    ssr: false,
  })
}

// フィーチャーフラグ付きコンポーネント
export function createFeatureFlagLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  featureFlag: string,
  fallback?: ComponentType,
) {
  // 環境変数からフィーチャーフラグを確認
  const isEnabled =
    process.env[`NEXT_PUBLIC_FEATURE_${featureFlag.toUpperCase()}`] === 'true'

  if (!isEnabled) {
    return fallback || (() => null)
  }

  return dynamic(importFn, {
    loading: () => <LoadingSpinner />,
    ssr: false,
  })
}
