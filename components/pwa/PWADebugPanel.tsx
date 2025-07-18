'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { offlineStorage } from '@/lib/offline-storage'
import {
  Wifi,
  WifiOff,
  Database,
  RotateCcw,
  Smartphone,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

interface PWADebugPanelProps {
  className?: string
}

export default function PWADebugPanel({ className }: PWADebugPanelProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false)
  const [serviceWorkerStatus, setServiceWorkerStatus] =
    useState<string>('Unknown')
  const [storageInfo, setStorageInfo] = useState({
    totalItems: 0,
    unsyncedItems: 0,
  })
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // 初期状態の設定
    setIsOnline(navigator.onLine)
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true,
    )

    // Service Worker の状態確認
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          if (registration.active) {
            setServiceWorkerStatus('Active')
          } else if (registration.installing) {
            setServiceWorkerStatus('Installing')
          } else if (registration.waiting) {
            setServiceWorkerStatus('Waiting')
          }
        })
        .catch(() => {
          setServiceWorkerStatus('Error')
        })
    } else {
      setServiceWorkerStatus('Not Supported')
    }

    // オフラインストレージ情報の取得
    updateStorageInfo()

    // オンライン/オフライン状態の監視
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateStorageInfo = async () => {
    try {
      await offlineStorage.init()
      const info = await offlineStorage.getStorageInfo()
      setStorageInfo(info)
    } catch (error) {
      console.error('Failed to get storage info:', error)
    }
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const { syncOfflineData } = await import('@/lib/offline-storage')
      await syncOfflineData()
      await updateStorageInfo()
      console.log('Manual sync completed')
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleTestOfflineData = async () => {
    try {
      await offlineStorage.init()
      await offlineStorage.saveOfflineData('post', {
        content: 'Test post from debug panel',
        timestamp: Date.now(),
      })
      await updateStorageInfo()
      console.log('Test data saved')
    } catch (error) {
      console.error('Failed to save test data:', error)
    }
  }

  const handleClearStorage = async () => {
    try {
      await offlineStorage.init()
      await offlineStorage.clearSyncedData()
      await updateStorageInfo()
      console.log('Storage cleared')
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  const handleServiceWorkerUpdate = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          console.log('Service Worker update check completed')
        }
      } catch (error) {
        console.error('Service Worker update failed:', error)
      }
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Smartphone className="mr-2 h-5 w-5" />
          PWA Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 接続状態 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="mr-2 h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">接続状態</span>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'オンライン' : 'オフライン'}
          </Badge>
        </div>

        {/* PWA状態 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Smartphone className="mr-2 h-4 w-4" />
            <span className="text-sm">PWA状態</span>
          </div>
          <Badge variant={isStandalone ? 'default' : 'outline'}>
            {isStandalone ? 'インストール済み' : 'ブラウザ'}
          </Badge>
        </div>

        {/* Service Worker状態 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {serviceWorkerStatus === 'Active' ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">Service Worker</span>
          </div>
          <Badge
            variant={
              serviceWorkerStatus === 'Active'
                ? 'default'
                : serviceWorkerStatus === 'Error' ||
                    serviceWorkerStatus === 'Not Supported'
                  ? 'destructive'
                  : 'outline'
            }
          >
            {serviceWorkerStatus}
          </Badge>
        </div>

        {/* ストレージ情報 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              <span className="text-sm">オフラインデータ</span>
            </div>
            <span className="text-sm font-medium">
              {storageInfo.totalItems}件
            </span>
          </div>
          {storageInfo.unsyncedItems > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-600">未同期データ</span>
              <Badge variant="outline" className="text-yellow-600">
                {storageInfo.unsyncedItems}件
              </Badge>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleManualSync}
            disabled={isSyncing || !isOnline}
            size="sm"
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                同期中...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                手動同期
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleTestOfflineData} variant="outline" size="sm">
              テストデータ
            </Button>
            <Button onClick={handleClearStorage} variant="outline" size="sm">
              ストレージクリア
            </Button>
          </div>

          <Button
            onClick={handleServiceWorkerUpdate}
            variant="outline"
            size="sm"
            className="w-full"
          >
            SW更新確認
          </Button>
        </div>

        {/* 注意事項 */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          このパネルは開発・デバッグ用です。本番環境では非表示にしてください。
        </div>
      </CardContent>
    </Card>
  )
}
