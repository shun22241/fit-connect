'use client'

import { useEffect, useState } from 'react'
import PWAInstallPrompt from './PWAInstallPrompt'
import PWAUpdateNotification from './PWAUpdateNotification'
import { offlineStorage, syncOfflineData } from '@/lib/offline-storage'

interface PWAProviderProps {
  children: React.ReactNode
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // スタンドアロンモード（PWAとしてインストール済み）の確認
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')

      setIsStandalone(isStandaloneMode)
    }

    // Service Worker の登録
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(
            '/sw.js',
            {
              scope: '/',
              updateViaCache: 'none',
            },
          )

          console.log('Service Worker registered successfully:', registration)

          // アップデートの確認
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setUpdateAvailable(true)
                }
              })
            }
          })

          // ページロード時にアップデートをチェック
          if (registration.waiting) {
            setUpdateAvailable(true)
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }
    }

    // PWAインストールプロンプトの処理
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // PWAがインストールされた後の処理
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    // オンライン/オフライン状態の監視
    const handleOnline = async () => {
      console.log('App is back online')

      // オフラインストレージの初期化
      try {
        await offlineStorage.init()

        // オフラインデータの同期を実行
        await syncOfflineData()
        console.log('Offline data sync completed')
      } catch (error) {
        console.error('Failed to sync offline data:', error)
      }
    }

    const handleOffline = async () => {
      console.log('App is offline')

      // オフラインストレージの初期化
      try {
        await offlineStorage.init()
        console.log('Offline storage initialized')
      } catch (error) {
        console.error('Failed to initialize offline storage:', error)
      }
    }

    // イベントリスナーの設定
    checkStandalone()
    registerServiceWorker()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // iOS Safari での PWA 検出
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = (window.navigator as any).standalone

    if (isIOS && !isInStandaloneMode) {
      // iOS で Safari ブラウザから見ている場合、しばらくしてからインストールプロンプトを表示
      const timer = setTimeout(() => {
        if (!isInStandaloneMode) {
          setShowInstallPrompt(true)
        }
      }, 10000) // 10秒後

      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // プッシュ通知の許可要求
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = await Notification.requestPermission()
        console.log('Notification permission:', permission)

        if (permission === 'granted') {
          // プッシュ通知の登録処理
          registerPushNotifications()
        }
      }
    }

    // スタンドアロンモードでのみ通知許可を要求
    if (isStandalone) {
      setTimeout(requestNotificationPermission, 5000) // 5秒後
    }
  }, [isStandalone])

  const registerPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready

      // VAPID公開キー（実際のプロジェクトでは環境変数から取得）
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'your-vapid-public-key-here'

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      })

      console.log('Push subscription:', subscription)

      // サーバーに購読情報を送信
      // await fetch('/api/push-subscription', {
      //   method: 'POST',
      //   body: JSON.stringify(subscription),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // })
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
    }
  }

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to install prompt: ${outcome}`)

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      }
    }
  }

  const handleDismissInstall = () => {
    setShowInstallPrompt(false)
    // 24時間後に再度表示
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }
  }

  const handleUpdateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  const shouldShowInstallPrompt = () => {
    if (typeof window === 'undefined') return false

    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const dayInMs = 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < dayInMs) {
        return false
      }
    }
    return showInstallPrompt && !isStandalone
  }

  return (
    <>
      {children}

      {/* PWA インストールプロンプト */}
      {shouldShowInstallPrompt() && (
        <PWAInstallPrompt
          onInstall={handleInstallPWA}
          onDismiss={handleDismissInstall}
          isIOS={/iPad|iPhone|iPod/.test(navigator.userAgent)}
        />
      )}

      {/* PWA アップデート通知 */}
      {updateAvailable && (
        <PWAUpdateNotification
          onUpdate={handleUpdateApp}
          onDismiss={() => setUpdateAvailable(false)}
        />
      )}
    </>
  )
}
