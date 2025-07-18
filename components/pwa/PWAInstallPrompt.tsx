'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, X, Smartphone, Share, Plus } from 'lucide-react'

interface PWAInstallPromptProps {
  onInstall: () => void
  onDismiss: () => void
  isIOS: boolean
}

export default function PWAInstallPrompt({
  onInstall,
  onDismiss,
  isIOS,
}: PWAInstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // アニメーションのために少し遅延して表示
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // アニメーション完了後に実際に非表示
  }

  const handleInstall = () => {
    setIsVisible(false)
    setTimeout(onInstall, 300)
  }

  if (isIOS) {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Card className="bg-blue-50 border-blue-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">
                    FitConnectをホーム画面に追加
                  </h3>
                </div>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    より快適にご利用いただくために、ホーム画面に追加してください：
                  </p>
                  <div className="flex items-center space-x-2 bg-white bg-opacity-50 p-2 rounded">
                    <Share className="h-4 w-4" />
                    <span>1. 下部の「共有」ボタンをタップ</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white bg-opacity-50 p-2 rounded">
                    <Plus className="h-4 w-4" />
                    <span>2. 「ホーム画面に追加」を選択</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  FitConnectをインストール
                </h3>
                <p className="text-blue-100 text-sm">
                  オフライン機能とプッシュ通知でより便利に
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleInstall}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                インストール
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 機能のハイライト */}
          <div className="mt-3 pt-3 border-t border-blue-500 border-opacity-30">
            <div className="grid grid-cols-3 gap-4 text-xs text-blue-100">
              <div className="text-center">
                <div className="font-medium">⚡ 高速起動</div>
                <div>アプリのような体験</div>
              </div>
              <div className="text-center">
                <div className="font-medium">📱 オフライン対応</div>
                <div>ネット接続不要</div>
              </div>
              <div className="text-center">
                <div className="font-medium">🔔 プッシュ通知</div>
                <div>重要な更新をお知らせ</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
