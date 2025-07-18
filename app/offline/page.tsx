'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  WifiOff,
  RefreshCw,
  Home,
  Smartphone,
  Download,
  CheckCircle,
} from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    // オンライン状態の監視
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 初期状態の設定
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setRetrying(true)

    try {
      // ネットワーク接続を確認
      await fetch('/', { method: 'HEAD', mode: 'no-cors' })
      window.location.href = '/'
    } catch (error) {
      console.log('Still offline')
      setTimeout(() => setRetrying(false), 1000)
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* メイン オフライン カード */}
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              オフラインです
            </CardTitle>
            <div className="flex justify-center">
              <Badge
                variant={isOnline ? 'default' : 'secondary'}
                className={
                  isOnline
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {isOnline ? 'オンライン' : 'オフライン'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              インターネット接続を確認してください。FitConnectの一部機能は
              オフラインでもご利用いただけます。
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full"
                size="lg"
              >
                {retrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    接続確認中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    再試行
                  </>
                )}
              </Button>

              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* オフライン機能案内 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Smartphone className="mr-2 h-5 w-5" />
              オフライン機能
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">キャッシュされたページ</div>
                  <div className="text-gray-600">
                    以前に閲覧したページを表示
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">オフライン投稿作成</div>
                  <div className="text-gray-600">接続復旧時に自動同期</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">ローカルデータ閲覧</div>
                  <div className="text-gray-600">
                    保存済みワークアウトの確認
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA インストール案内 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-blue-900">
              <Download className="mr-2 h-5 w-5" />
              アプリをインストール
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 text-sm leading-relaxed">
              FitConnectをホーム画面に追加して、よりアプリのような体験をお楽しみください。
              オフライン機能がさらに向上します。
            </p>
          </CardContent>
        </Card>

        {/* 接続のヒント */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              接続のトラブルシューティング
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Wi-Fi接続を確認してください</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>モバイルデータの設定を確認</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>ページを更新してみてください</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>しばらく待ってから再試行</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
