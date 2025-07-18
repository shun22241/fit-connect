import { logger } from './logger'

// パフォーマンスメトリクス管理
class PerformanceMonitor {
  private metrics: Map<string, { value: number; timestamp: number }> = new Map()
  private counters: Map<string, number> = new Map()
  private timers: Map<string, number> = new Map()

  // メトリクスの記録
  recordMetric(name: string, value: number) {
    this.metrics.set(name, {
      value,
      timestamp: Date.now(),
    })

    logger.debug('Metric recorded', { name, value })
  }

  // カウンターのインクリメント
  incrementCounter(name: string, value: number = 1) {
    const current = this.counters.get(name) || 0
    this.counters.set(name, current + value)

    logger.debug('Counter incremented', { name, value: current + value })
  }

  // タイマーの開始
  startTimer(name: string) {
    this.timers.set(name, Date.now())
  }

  // タイマーの終了と記録
  endTimer(name: string) {
    const startTime = this.timers.get(name)
    if (startTime) {
      const duration = Date.now() - startTime
      this.recordMetric(name, duration)
      this.timers.delete(name)
      return duration
    }
    return 0
  }

  // メトリクスの取得
  getMetrics() {
    const result: Record<string, any> = {}

    this.metrics.forEach((metric, name) => {
      result[name] = metric
    })

    this.counters.forEach((count, name) => {
      result[name] = { value: count, type: 'counter' }
    })

    return result
  }

  // メトリクスのリセット
  reset() {
    this.metrics.clear()
    this.counters.clear()
    this.timers.clear()
  }
}

// システムヘルスチェック
class HealthChecker {
  private checks: Map<string, () => Promise<boolean>> = new Map()

  // ヘルスチェック関数の登録
  registerCheck(name: string, checkFn: () => Promise<boolean>) {
    this.checks.set(name, checkFn)
  }

  // 全てのヘルスチェックを実行
  async runAllChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    for (const [name, checkFn] of this.checks) {
      try {
        results[name] = await checkFn()
      } catch (error) {
        logger.error(`Health check failed: ${name}`, {
          error: error instanceof Error ? error.message : String(error),
        })
        results[name] = false
      }
    }

    return results
  }

  // 個別ヘルスチェックの実行
  async runCheck(name: string): Promise<boolean> {
    const checkFn = this.checks.get(name)
    if (!checkFn) {
      throw new Error(`Health check not found: ${name}`)
    }

    try {
      return await checkFn()
    } catch (error) {
      logger.error(`Health check failed: ${name}`, {
        error: error instanceof Error ? error.message : String(error),
      })
      return false
    }
  }
}

// エラー追跡とアラート
class ErrorTracker {
  private errorCounts: Map<string, number> = new Map()
  private errorThresholds: Map<string, number> = new Map()
  private lastAlertTime: Map<string, number> = new Map()
  private alertCooldown = 5 * 60 * 1000 // 5分

  // エラー閾値の設定
  setErrorThreshold(errorType: string, threshold: number) {
    this.errorThresholds.set(errorType, threshold)
  }

  // エラーの記録
  recordError(errorType: string, error: Error, context?: Record<string, any>) {
    // エラーカウントの更新
    const currentCount = this.errorCounts.get(errorType) || 0
    this.errorCounts.set(errorType, currentCount + 1)

    // ログの記録
    logger.error(`Error tracked: ${errorType}`, {
      errorMessage: error.message,
      errorStack: error.stack,
      count: currentCount + 1,
      ...context,
    })

    // 閾値チェックとアラート
    this.checkThresholdAndAlert(errorType, currentCount + 1)
  }

  // 閾値チェックとアラート送信
  private checkThresholdAndAlert(errorType: string, count: number) {
    const threshold = this.errorThresholds.get(errorType)
    const lastAlert = this.lastAlertTime.get(errorType) || 0
    const now = Date.now()

    if (
      threshold &&
      count >= threshold &&
      now - lastAlert > this.alertCooldown
    ) {
      this.sendAlert(errorType, count, threshold)
      this.lastAlertTime.set(errorType, now)
    }
  }

  // アラート送信
  private sendAlert(errorType: string, count: number, threshold: number) {
    const alertMessage = `Error threshold exceeded: ${errorType} (${count}/${threshold})`

    logger.warn('Error threshold alert', {
      errorType,
      count,
      threshold,
      alertType: 'threshold_exceeded',
    })

    // 実際のアラート送信（Slack、メール、Discord等）
    this.sendExternalAlert(alertMessage, {
      errorType,
      count,
      threshold,
      timestamp: new Date().toISOString(),
    })
  }

  // 外部アラート送信（実装は環境に応じて）
  private async sendExternalAlert(
    message: string,
    details: Record<string, any>,
  ) {
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 FitConnect Alert: ${message}`,
            attachments: [
              {
                color: 'danger',
                fields: Object.entries(details).map(([key, value]) => ({
                  title: key,
                  value: String(value),
                  short: true,
                })),
              },
            ],
          }),
        })
      } catch (error) {
        logger.error('Failed to send Slack alert', {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **FitConnect Alert**\n${message}`,
            embeds: [
              {
                title: 'Error Details',
                color: 15158332, // Red color
                fields: Object.entries(details).map(([key, value]) => ({
                  name: key,
                  value: String(value),
                  inline: true,
                })),
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        })
      } catch (error) {
        logger.error('Failed to send Discord alert', {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  // エラー統計の取得
  getErrorStats() {
    const stats: Record<string, any> = {}

    this.errorCounts.forEach((count, errorType) => {
      stats[errorType] = {
        count,
        threshold: this.errorThresholds.get(errorType),
        lastAlert: this.lastAlertTime.get(errorType),
      }
    })

    return stats
  }

  // エラーカウントのリセット
  resetErrorCounts() {
    this.errorCounts.clear()
    logger.info('Error counts reset')
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor()
export const healthChecker = new HealthChecker()
export const errorTracker = new ErrorTracker()

// デフォルトヘルスチェックの設定
healthChecker.registerCheck('database', async () => {
  try {
    const { prisma } = await import('./prisma')
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
})

healthChecker.registerCheck('redis', async () => {
  if (!process.env.REDIS_URL) return true

  try {
    // Redis 接続チェック（実装は環境に応じて）
    return true
  } catch {
    return false
  }
})

healthChecker.registerCheck('external_apis', async () => {
  try {
    // OpenAI API の簡単なチェック
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })
      return response.ok
    }
    return true
  } catch {
    return false
  }
})

// デフォルトエラー閾値の設定
errorTracker.setErrorThreshold('api_error', 10)
errorTracker.setErrorThreshold('database_error', 5)
errorTracker.setErrorThreshold('auth_error', 20)
errorTracker.setErrorThreshold('validation_error', 50)

// ミドルウェア: パフォーマンス測定
export function performanceMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now()
  const timerName = `request_${req.method}_${req.route?.path || req.path}`

  performanceMonitor.startTimer(timerName)
  performanceMonitor.incrementCounter('total_requests')
  performanceMonitor.incrementCounter(`requests_${req.method.toLowerCase()}`)

  res.on('finish', () => {
    const duration = performanceMonitor.endTimer(timerName)
    performanceMonitor.recordMetric('response_time', duration)
    performanceMonitor.incrementCounter(`responses_${res.statusCode}`)

    if (res.statusCode >= 400) {
      performanceMonitor.incrementCounter('error_responses')
    }
  })

  next()
}

// 定期的なメトリクス報告
export function startPeriodicReporting(intervalMinutes: number = 5) {
  setInterval(
    () => {
      const metrics = performanceMonitor.getMetrics()
      logger.info('Periodic metrics report', { metrics })

      // メトリクスをリセット（累積を避けるため）
      performanceMonitor.reset()
    },
    intervalMinutes * 60 * 1000,
  )
}

// システムリソース監視 (Edge Runtime対応)
export function monitorSystemResources() {
  // Edge Runtime では process.memoryUsage() と process.cpuUsage() が利用できません
  // 代わりに基本的なメトリクスを記録します
  setInterval(() => {
    try {
      // Edge Runtime で利用可能な情報のみ使用
      const timestamp = Date.now()
      performanceMonitor.recordMetric('monitoring_timestamp', timestamp)
      
      // メモリ使用量は推定値を使用
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memoryUsage = process.memoryUsage()
        performanceMonitor.recordMetric('memory_heap_used', memoryUsage.heapUsed)
        performanceMonitor.recordMetric('memory_heap_total', memoryUsage.heapTotal)
        performanceMonitor.recordMetric('memory_external', memoryUsage.external)
      }
      
      // CPU使用量は推定値を使用
      if (typeof process !== 'undefined' && process.cpuUsage) {
        const cpuUsage = process.cpuUsage()
        performanceMonitor.recordMetric('cpu_user', cpuUsage.user)
        performanceMonitor.recordMetric('cpu_system', cpuUsage.system)
      }
    } catch (error) {
      // Edge Runtime では利用できない場合はスキップ
      logger.debug('System resource monitoring not available in Edge Runtime')
    }

    // Edge Runtime対応のログ出力
    logger.debug('System resources monitored', {
      timestamp: new Date().toISOString(),
      runtime: 'edge-compatible'
    })
  }, 30000) // 30秒ごと
}

const monitoring = {
  performanceMonitor,
  healthChecker,
  errorTracker,
  performanceMiddleware,
  startPeriodicReporting,
  monitorSystemResources,
}

export default monitoring
