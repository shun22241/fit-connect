'use client'

// シンプルなインメモリキャッシュ
export class CacheStrategy {
  private static instance: CacheStrategy
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): CacheStrategy {
    if (!this.instance) {
      this.instance = new CacheStrategy()
    }
    return this.instance
  }

  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > cached.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  clearExpired(): void {
    const now = Date.now()
    Array.from(this.cache.entries())
      .filter(([_, cached]) => now - cached.timestamp > cached.ttl)
      .forEach(([key]) => this.cache.delete(key))
  }
}

// キャッシュの初期化
export function initializeCache() {
  const cache = CacheStrategy.getInstance()

  // 定期的にキャッシュをクリーンアップ
  setInterval(
    () => {
      cache.clearExpired()
    },
    10 * 60 * 1000,
  ) // 10分ごと

  // ページアンロード時にキャッシュをクリア
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      cache.clear()
    })
  }
}

export default CacheStrategy
