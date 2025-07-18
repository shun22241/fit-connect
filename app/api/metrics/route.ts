import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor, errorTracker } from '@/lib/monitoring'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // API キーまたは管理者認証の確認（本番環境では必須）
    const authHeader = request.headers.get('authorization')
    const apiKey = request.headers.get('x-api-key')

    if (process.env.NODE_ENV === 'production') {
      if (!authHeader && !apiKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // 簡易的な API キー認証
      if (apiKey && apiKey !== process.env.METRICS_API_KEY) {
        logger.warn('Unauthorized metrics access attempt', {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent'),
        })
        return NextResponse.json({ error: 'Invalid API key' }, { status: 403 })
      }
    }

    logger.info('Metrics requested')

    // パフォーマンスメトリクスの取得
    const performanceMetrics = performanceMonitor.getMetrics()

    // エラー統計の取得
    const errorStats = errorTracker.getErrorStats()

    // システムメトリクスの取得
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    // Node.js プロセス情報
    const processInfo = {
      pid: process.pid,
      uptime: process.uptime(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    }

    const metricsData = {
      timestamp: new Date().toISOString(),
      application: {
        name: 'FitConnect',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      system: {
        memory: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
          arrayBuffers: memoryUsage.arrayBuffers,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        process: processInfo,
      },
      performance: performanceMetrics,
      errors: errorStats,
      custom: {
        // カスタムメトリクスがあれば追加
      },
    }

    return NextResponse.json(metricsData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    logger.error('Failed to retrieve metrics', {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        error: 'Failed to retrieve metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// Prometheus 形式のメトリクス出力
export async function OPTIONS(request: NextRequest) {
  try {
    const performanceMetrics = performanceMonitor.getMetrics()
    const errorStats = errorTracker.getErrorStats()
    const memoryUsage = process.memoryUsage()

    // Prometheus 形式のメトリクス生成
    const prometheusMetrics = [
      '# HELP fitconnect_memory_heap_used Heap memory used in bytes',
      '# TYPE fitconnect_memory_heap_used gauge',
      `fitconnect_memory_heap_used ${memoryUsage.heapUsed}`,
      '',
      '# HELP fitconnect_memory_heap_total Total heap memory in bytes',
      '# TYPE fitconnect_memory_heap_total gauge',
      `fitconnect_memory_heap_total ${memoryUsage.heapTotal}`,
      '',
      '# HELP fitconnect_uptime_seconds Process uptime in seconds',
      '# TYPE fitconnect_uptime_seconds counter',
      `fitconnect_uptime_seconds ${process.uptime()}`,
      '',
    ]

    // パフォーマンスメトリクスを追加
    Object.entries(performanceMetrics).forEach(([name, metric]) => {
      if (typeof metric === 'object' && 'value' in metric) {
        prometheusMetrics.push(`# HELP fitconnect_${name} ${name} metric`)
        prometheusMetrics.push(`# TYPE fitconnect_${name} gauge`)
        prometheusMetrics.push(`fitconnect_${name} ${metric.value}`)
        prometheusMetrics.push('')
      }
    })

    // エラー統計を追加
    Object.entries(errorStats).forEach(([errorType, stats]) => {
      if (typeof stats === 'object' && 'count' in stats) {
        prometheusMetrics.push(
          `# HELP fitconnect_errors_total Total error count by type`,
        )
        prometheusMetrics.push(`# TYPE fitconnect_errors_total counter`)
        prometheusMetrics.push(
          `fitconnect_errors_total{type="${errorType}"} ${stats.count}`,
        )
        prometheusMetrics.push('')
      }
    })

    return new NextResponse(prometheusMetrics.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    logger.error('Failed to generate Prometheus metrics', {
      error: error instanceof Error ? error.message : String(error),
    })

    return new NextResponse('# Error generating metrics\n', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
}
