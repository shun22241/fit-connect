'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, X, Download, Sparkles } from 'lucide-react'

interface PWAUpdateNotificationProps {
  onUpdate: () => void
  onDismiss: () => void
}

export default function PWAUpdateNotification({
  onUpdate,
  onDismiss,
}: PWAUpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // アニメーションのために少し遅延して表示
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)

    try {
      // 少し待ってからアップデートを実行（UX向上のため）
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onUpdate()
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                {isUpdating ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold">アップデート利用可能</h3>
                  <Badge
                    variant="secondary"
                    className="bg-white bg-opacity-20 text-green-100 text-xs"
                  >
                    NEW
                  </Badge>
                </div>

                <p className="text-green-100 text-sm mb-3">
                  {isUpdating
                    ? 'アップデートを適用中...'
                    : '新しい機能と改善が利用可能です'}
                </p>

                {!isUpdating && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-100 space-y-1">
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                        <span>パフォーマンスの向上</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                        <span>新機能の追加</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                        <span>バグの修正</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isUpdating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-white hover:bg-opacity-20 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex space-x-2 mt-3">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              size="sm"
              className="bg-white text-green-600 hover:bg-gray-100 flex-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  今すぐ更新
                </>
              )}
            </Button>

            {!isUpdating && (
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                後で
              </Button>
            )}
          </div>

          {isUpdating && (
            <div className="mt-3 pt-3 border-t border-green-500 border-opacity-30">
              <div className="flex items-center justify-center space-x-2 text-xs text-green-100">
                <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                <span>アプリケーションが再起動されます</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
