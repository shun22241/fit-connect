// Service Worker for FitConnect PWA
const CACHE_NAME = 'fitconnect-v1'
const STATIC_CACHE_NAME = 'fitconnect-static-v1'
const DYNAMIC_CACHE_NAME = 'fitconnect-dynamic-v1'

// キャッシュするリソース
const STATIC_ASSETS = [
  '/',
  '/demo',
  '/offline',
  '/manifest.json',
  // 必要に応じて追加のリソースをここに記述
]

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')

  event.waitUntil(
    Promise.all([
      // 静的アセットのキャッシュ
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      // 即座にアクティベート
      self.skipWaiting(),
    ]),
  )
})

// アクティベート時の処理（古いキャッシュの削除）
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')

  event.waitUntil(
    Promise.all([
      // 古いキャッシュの削除
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME
              )
            })
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }),
        )
      }),
      // 全てのクライアントでService Workerを制御開始
      self.clients.claim(),
    ]),
  )
})

// フェッチ時の処理（ネットワーク優先 → キャッシュフォールバック戦略）
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return
  }

  // APIリクエストの場合
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // ページリクエストの場合
  if (request.mode === 'navigate') {
    event.respondWith(handlePageRequest(request))
    return
  }

  // その他のリソース（CSS、JS、画像など）
  event.respondWith(handleResourceRequest(request))
})

// APIリクエストの処理（ネットワーク優先）
async function handleApiRequest(request) {
  try {
    const response = await fetch(request)

    // 成功したレスポンスをキャッシュ（GET リクエストのみ）
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.log('Service Worker: Network failed for API, trying cache...')

    // キャッシュから取得を試行
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // オフライン用のレスポンスを返す
    return new Response(
      JSON.stringify({
        error: 'オフラインです。インターネット接続を確認してください。',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}

// ページリクエストの処理
async function handlePageRequest(request) {
  try {
    const response = await fetch(request)

    if (response.ok) {
      // 成功したページをキャッシュ
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.log('Service Worker: Network failed for page, trying cache...')

    // キャッシュから取得を試行
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // オフラインページを返す
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }

    // 最後の手段：基本的なオフラインページ
    return new Response(
      `<!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>オフライン - FitConnect</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5; 
          }
          .container { 
            max-width: 400px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
          }
          h1 { color: #333; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          .retry-btn { 
            background: #2563eb; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            margin-top: 20px; 
          }
          .retry-btn:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔌 オフラインです</h1>
          <p>インターネット接続を確認して、もう一度お試しください。</p>
          <button class="retry-btn" onclick="window.location.reload()">再試行</button>
        </div>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      },
    )
  }
}

// リソースリクエストの処理（キャッシュ優先）
async function handleResourceRequest(request) {
  // POSTリクエストなどはキャッシュしない
  if (request.method !== 'GET') {
    return fetch(request)
  }

  // まずキャッシュから確認
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)

    if (response.ok && request.method === 'GET') {
      // 成功したGETリクエストのみキャッシュ
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.log('Service Worker: Failed to fetch resource:', request.url)

    // リソースが見つからない場合の基本的な応答
    return new Response('Resource not available offline', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received')

  const options = {
    body: '新しい通知があります',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: '開く',
        icon: '/icons/icon-72x72.png',
      },
      {
        action: 'close',
        title: '閉じる',
      },
    ],
    tag: 'fitconnect-notification',
    renotify: true,
  }

  if (event.data) {
    try {
      const data = event.data.json()
      options.body = data.body || options.body
      options.data.url = data.url || options.data.url

      if (data.type === 'workout_reminder') {
        options.title = '🏋️ ワークアウトタイム！'
        options.body = data.body || '今日もトレーニングを頑張りましょう！'
        options.data.url = '/workouts/new'
      } else if (data.type === 'social_interaction') {
        options.title = '💬 新しい通知'
        options.body = data.body || 'あなたの投稿に新しいリアクションがあります'
        options.data.url = '/feed'
      } else if (data.type === 'achievement') {
        options.title = '🏆 おめでとうございます！'
        options.body = data.body || '新しい目標を達成しました！'
        options.data.url = '/profile'
      } else if (data.type === 'message') {
        options.title = '📨 新しいメッセージ'
        options.body = data.body || '新しいメッセージが届いています'
        options.data.url = '/messages'
      } else if (data.type === 'ai_coaching') {
        options.title = '🤖 AIコーチからのアドバイス'
        options.body =
          data.body || 'あなたにピッタリのワークアウト提案があります'
        options.data.url = '/ai-chat'
      } else {
        options.title = data.title || '📱 FitConnect'
      }
    } catch (error) {
      console.error('プッシュデータの解析エラー:', error)
      options.title = '📱 FitConnect'
    }
  } else {
    options.title = '📱 FitConnect'
  }

  event.waitUntil(self.registration.showNotification(options.title, options))
})

// 通知のクリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('通知クリック:', event)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 既存のタブがあるかチェック
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: urlToOpen,
            })
            return client.focus()
          }
        }

        // 新しいタブを開く
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})

// 通知の閉じる処理
self.addEventListener('notificationclose', (event) => {
  console.log('通知が閉じられました:', event)

  // アナリティクス送信など
  event.waitUntil(
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      body: JSON.stringify({
        timestamp: Date.now(),
        tag: event.notification.tag,
      }),
    }).catch(() => {
      // エラーは無視
    }),
  )
})

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered')

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // オフライン時に蓄積されたデータを同期
  console.log('Service Worker: Performing background sync')

  try {
    // IndexedDBからオフラインデータを取得
    const offlineData = await getOfflineData()

    for (const item of offlineData) {
      try {
        if (item.type === 'workout') {
          await syncWorkout(item.data)
        } else if (item.type === 'post') {
          await syncPost(item.data)
        }

        // 同期成功後、ローカルデータを削除
        await removeOfflineData(item.id)
      } catch (error) {
        console.error('Failed to sync item:', item.id, error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// オフラインデータの取得
async function getOfflineData() {
  try {
    const db = await openDB()
    const transaction = db.transaction(['offlineData'], 'readonly')
    const store = transaction.objectStore('offlineData')
    const index = store.index('synced')

    return new Promise((resolve, reject) => {
      const request = index.getAll(false)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get offline data'))
    })
  } catch (error) {
    console.error('Error getting offline data:', error)
    return []
  }
}

// IndexedDBを開く
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FitConnectOfflineDB', 1)

    request.onerror = () => reject(new Error('Failed to open IndexedDB'))
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('offlineData')) {
        const store = db.createObjectStore('offlineData', { keyPath: 'id' })
        store.createIndex('type', 'type', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('synced', 'synced', { unique: false })
      }
    }
  })
}

// ワークアウトデータの同期
async function syncWorkout(workoutData) {
  const response = await fetch('/api/workouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workoutData),
  })

  if (!response.ok) {
    throw new Error('Failed to sync workout')
  }

  return response.json()
}

// 投稿データの同期
async function syncPost(postData) {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  })

  if (!response.ok) {
    throw new Error('Failed to sync post')
  }

  return response.json()
}

// オフラインデータの削除
async function removeOfflineData(id) {
  try {
    const db = await openDB()
    const transaction = db.transaction(['offlineData'], 'readwrite')
    const store = transaction.objectStore('offlineData')

    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => {
        console.log('Removed offline data:', id)
        resolve()
      }
      request.onerror = () => reject(new Error('Failed to remove offline data'))
    })
  } catch (error) {
    console.error('Error removing offline data:', error)
  }
}
