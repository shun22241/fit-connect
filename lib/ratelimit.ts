// シンプルなインメモリレート制限（本番環境ではRedisを推奨）
class RateLimiter {
  private cache: Map<string, { count: number; reset: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // 5分ごとに期限切れエントリをクリーンアップ
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  async limit(
    identifier: string,
    config: { requests: number; window: string },
  ): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const windowMs = this.parseWindow(config.window)
    const now = Date.now()
    const windowStart = now - windowMs
    const key = `${identifier}:${Math.floor(now / windowMs)}`

    const existing = this.cache.get(key)

    if (!existing) {
      // 新しいウィンドウ
      this.cache.set(key, {
        count: 1,
        reset: now + windowMs,
      })

      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        reset: now + windowMs,
      }
    }

    if (existing.count >= config.requests) {
      // レート制限に達している
      return {
        success: false,
        limit: config.requests,
        remaining: 0,
        reset: existing.reset,
      }
    }

    // カウントを増加
    existing.count++
    this.cache.set(key, existing)

    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - existing.count,
      reset: existing.reset,
    }
  }

  private parseWindow(window: string): number {
    const match = window.match(/^(\d+)([smhd])$/)
    if (!match) throw new Error('Invalid window format')

    const [, amount, unit] = match
    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }

    return parseInt(amount) * multipliers[unit as keyof typeof multipliers]
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now > value.reset) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// シングルトンインスタンス
export const ratelimit = new RateLimiter()

// APIルート用のレート制限ミドルウェア
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: {
    requests: number
    window: string
    keyGenerator?: (request: Request) => string
  },
) {
  return async (request: Request): Promise<Response> => {
    try {
      // キー生成（デフォルトはIPアドレス）
      const key = config.keyGenerator
        ? config.keyGenerator(request)
        : getClientIP(request)

      const result = await ratelimit.limit(key, config)

      // レスポンスヘッダーに制限情報を追加
      const headers = new Headers()
      headers.set('X-RateLimit-Limit', result.limit.toString())
      headers.set('X-RateLimit-Remaining', result.remaining.toString())
      headers.set('X-RateLimit-Reset', result.reset.toString())

      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: 'Too Many Requests',
            message:
              'レート制限に達しました。しばらく待ってから再試行してください。',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(headers.entries()),
              'Retry-After': Math.ceil(
                (result.reset - Date.now()) / 1000,
              ).toString(),
            },
          },
        )
      }

      const response = await handler(request)

      // 成功時もヘッダーを追加
      Object.entries(Object.fromEntries(headers.entries())).forEach(
        ([key, value]) => {
          response.headers.set(key, value)
        },
      )

      return response
    } catch (error) {
      console.error('Rate limiting error:', error)
      return await handler(request)
    }
  }
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()

  return 'unknown'
}

// 特定用途向けの事前設定済みレート制限
export const rateLimitConfigs = {
  // 一般的なAPI
  api: {
    requests: 100,
    window: '1h',
  },
  // 認証関連
  auth: {
    requests: 5,
    window: '15m',
  },
  // ファイルアップロード
  upload: {
    requests: 10,
    window: '1h',
  },
  // 検索API
  search: {
    requests: 50,
    window: '1h',
  },
  // AI API（コストが高い）
  ai: {
    requests: 20,
    window: '1h',
  },
  // プッシュ通知
  push: {
    requests: 100,
    window: '1d',
  },
  // 厳格制限（管理者機能など）
  strict: {
    requests: 10,
    window: '1h',
  },
}

// ユーザー固有のレート制限
export function createUserRateLimit(userId: string) {
  return {
    keyGenerator: () => `user:${userId}`,
  }
}

// IP固有のレート制限
export function createIPRateLimit() {
  return {
    keyGenerator: (request: Request) => `ip:${getClientIP(request)}`,
  }
}

// エンドポイント固有のレート制限
export function createEndpointRateLimit(endpoint: string) {
  return {
    keyGenerator: (request: Request) =>
      `endpoint:${endpoint}:${getClientIP(request)}`,
  }
}
