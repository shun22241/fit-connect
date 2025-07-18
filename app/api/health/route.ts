import { NextRequest, NextResponse } from 'next/server'
import { healthChecker, performanceMonitor } from '@/lib/monitoring'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.info('Health check requested')

    // 全てのヘルスチェックを実行
    const healthChecks = await healthChecker.runAllChecks()

    // システムメトリクスの取得
    const metrics = performanceMonitor.getMetrics()

    // メモリ使用量の取得
    const memoryUsage = process.memoryUsage()

    // 稼働時間の取得
    const uptime = process.uptime()

    // 全体的な健康状態の判定
    const isHealthy = Object.values(healthChecks).every(
      (check) => check === true,
    )

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      checks: healthChecks,
      metrics: {
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        },
        performance: metrics,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${Date.now() - startTime}ms`,
    }

    logger.info('Health check completed', {
      status: healthData.status,
      responseTime: healthData.responseTime,
    })

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// シンプルなヘルスチェック用（ロードバランサー等で使用）
export async function HEAD(request: NextRequest) {
  try {
    // 軽量なヘルスチェック
    const dbCheck = await healthChecker.runCheck('database')

    return new NextResponse(null, {
      status: dbCheck ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
