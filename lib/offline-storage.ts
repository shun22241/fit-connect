// IndexedDBを使用したオフライン ストレージ ユーティリティ

interface OfflineItem {
  id: string
  type: 'workout' | 'post' | 'comment' | 'like'
  data: any
  timestamp: number
  synced: boolean
}

class OfflineStorage {
  private dbName = 'FitConnectOfflineDB'
  private dbVersion = 1
  private storeName = 'offlineData'
  private db: IDBDatabase | null = null

  // データベースの初期化
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // オブジェクトストアが存在しない場合は作成
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('synced', 'synced', { unique: false })
        }
      }
    })
  }

  // オフラインデータの保存
  async saveOfflineData(
    type: OfflineItem['type'],
    data: any,
    id?: string,
  ): Promise<string> {
    if (!this.db) {
      await this.init()
    }

    const itemId =
      id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const item: OfflineItem = {
      id: itemId,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(item)

      request.onsuccess = () => resolve(itemId)
      request.onerror = () => reject(new Error('Failed to save offline data'))
    })
  }

  // 未同期データの取得
  async getUnsyncedData(): Promise<OfflineItem[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('synced')
      const request = index.getAll(IDBKeyRange.only(false))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get unsynced data'))
    })
  }

  // データの同期済みマーク
  async markAsSynced(id: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.synced = true
          const putRequest = store.put(item)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () =>
            reject(new Error('Failed to mark as synced'))
        } else {
          reject(new Error('Item not found'))
        }
      }

      getRequest.onerror = () => reject(new Error('Failed to get item'))
    })
  }

  // オフラインデータの削除
  async removeOfflineData(id: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to remove offline data'))
    })
  }

  // 特定タイプのデータ取得
  async getDataByType(type: OfflineItem['type']): Promise<OfflineItem[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('type')
      const request = index.getAll(type)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get data by type'))
    })
  }

  // 全データの削除（同期済みのみ）
  async clearSyncedData(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    const syncedData = await this.getSyncedData()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      let deletedCount = 0
      const totalCount = syncedData.length

      if (totalCount === 0) {
        resolve()
        return
      }

      syncedData.forEach((item) => {
        const request = store.delete(item.id)
        request.onsuccess = () => {
          deletedCount++
          if (deletedCount === totalCount) {
            resolve()
          }
        }
        request.onerror = () => reject(new Error('Failed to clear synced data'))
      })
    })
  }

  // 同期済みデータの取得
  private async getSyncedData(): Promise<OfflineItem[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('synced')
      const request = index.getAll(IDBKeyRange.only(true))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get synced data'))
    })
  }

  // ストレージサイズの取得
  async getStorageInfo(): Promise<{
    totalItems: number
    unsyncedItems: number
  }> {
    if (!this.db) {
      await this.init()
    }

    const [allData, unsyncedData] = await Promise.all([
      this.getAllData(),
      this.getUnsyncedData(),
    ])

    return {
      totalItems: allData.length,
      unsyncedItems: unsyncedData.length,
    }
  }

  // 全データの取得
  private async getAllData(): Promise<OfflineItem[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get all data'))
    })
  }
}

// シングルトンインスタンス
export const offlineStorage = new OfflineStorage()

// 便利な関数をエクスポート
export const saveOfflineWorkout = (workoutData: any) =>
  offlineStorage.saveOfflineData('workout', workoutData)

export const saveOfflinePost = (postData: any) =>
  offlineStorage.saveOfflineData('post', postData)

export const saveOfflineComment = (commentData: any) =>
  offlineStorage.saveOfflineData('comment', commentData)

export const saveOfflineLike = (likeData: any) =>
  offlineStorage.saveOfflineData('like', likeData)

// オンライン復帰時の同期処理
export const syncOfflineData = async () => {
  try {
    const unsyncedData = await offlineStorage.getUnsyncedData()

    for (const item of unsyncedData) {
      try {
        let endpoint = ''
        switch (item.type) {
          case 'workout':
            endpoint = '/api/workouts'
            break
          case 'post':
            endpoint = '/api/posts'
            break
          case 'comment':
            endpoint = `/api/posts/${item.data.postId}/comments`
            break
          case 'like':
            endpoint = `/api/posts/${item.data.postId}/like`
            break
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.data),
        })

        if (response.ok) {
          await offlineStorage.markAsSynced(item.id)
          console.log(`Synced ${item.type} data:`, item.id)
        } else {
          console.error(`Failed to sync ${item.type}:`, response.statusText)
        }
      } catch (error) {
        console.error(`Error syncing ${item.type}:`, error)
      }
    }

    // 同期済みデータのクリーンアップ（定期的に実行）
    await offlineStorage.clearSyncedData()
  } catch (error) {
    console.error('Offline sync failed:', error)
  }
}
