import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'システム監視ダッシュボード - FitConnect Admin',
  description: 'FitConnectアプリケーションのシステム監視とパフォーマンス分析',
}

// システム監視ダッシュボードコンポーネント
export default function SystemDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🖥️ システム監視ダッシュボード
          </h1>
          <p className="mt-2 text-gray-600">
            FitConnectアプリケーションのリアルタイム監視とパフォーマンス分析
          </p>
        </div>

        {/* システム概要 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SystemMetricCard
            title="システム稼働時間"
            value="99.9%"
            change="+0.1%"
            icon="⏰"
            color="green"
          />
          <SystemMetricCard
            title="アクティブユーザー"
            value="1,247"
            change="+12%"
            icon="👥"
            color="blue"
          />
          <SystemMetricCard
            title="API レスポンス"
            value="125ms"
            change="-5ms"
            icon="⚡"
            color="yellow"
          />
          <SystemMetricCard
            title="エラー率"
            value="0.02%"
            change="-0.01%"
            icon="🚨"
            color="red"
          />
        </div>

        {/* メインダッシュボードグリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* CPU & メモリ使用量 */}
          <DashboardCard title="システムリソース" icon="💾">
            <ResourceUsageChart />
          </DashboardCard>

          {/* API レスポンス時間 */}
          <DashboardCard title="API パフォーマンス" icon="📊">
            <ApiPerformanceChart />
          </DashboardCard>

          {/* データベース統計 */}
          <DashboardCard title="データベース統計" icon="🗄️">
            <DatabaseStats />
          </DashboardCard>

          {/* エラーログ */}
          <DashboardCard title="最近のエラー" icon="🚨">
            <ErrorLogsList />
          </DashboardCard>
        </div>

        {/* アラート・通知 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DashboardCard title="アクティブアラート" icon="⚠️">
            <ActiveAlerts />
          </DashboardCard>

          <DashboardCard title="トラフィック分析" icon="📈">
            <TrafficAnalysis />
          </DashboardCard>

          <DashboardCard title="システムヘルス" icon="💚">
            <SystemHealthCheck />
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}

// システムメトリクスカード
function SystemMetricCard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string
  value: string
  change: string
  icon: string
  color: 'green' | 'blue' | 'yellow' | 'red'
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
  }

  const changeColor = change.startsWith('+')
    ? change.includes('%') && parseFloat(change) > 0 && color === 'red'
      ? 'text-red-600'
      : 'text-green-600'
    : 'text-green-600'

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm ${changeColor}`}>{change} from last hour</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

// ダッシュボードカード
function DashboardCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      {children}
    </div>
  )
}

// リソース使用量チャート
function ResourceUsageChart() {
  const resourceData = [
    { name: 'CPU', usage: 45, color: 'bg-blue-500' },
    { name: 'Memory', usage: 68, color: 'bg-green-500' },
    { name: 'Disk', usage: 23, color: 'bg-yellow-500' },
    { name: 'Network', usage: 12, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-4">
      {resourceData.map((resource) => (
        <div key={resource.name}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {resource.name}
            </span>
            <span className="text-sm text-gray-500">{resource.usage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${resource.color}`}
              style={{ width: `${resource.usage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// API パフォーマンスチャート
function ApiPerformanceChart() {
  const apiEndpoints = [
    { endpoint: '/api/posts', avgTime: 120, requests: 1247 },
    { endpoint: '/api/workouts', avgTime: 89, requests: 893 },
    { endpoint: '/api/users', avgTime: 156, requests: 567 },
    { endpoint: '/api/auth', avgTime: 78, requests: 234 },
  ]

  return (
    <div className="space-y-3">
      {apiEndpoints.map((api) => (
        <div
          key={api.endpoint}
          className="flex justify-between items-center p-3 bg-gray-50 rounded"
        >
          <div>
            <div className="font-medium text-gray-900">{api.endpoint}</div>
            <div className="text-sm text-gray-500">
              {api.requests} requests/hour
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">{api.avgTime}ms</div>
            <div className="text-sm text-gray-500">avg response</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// データベース統計
function DatabaseStats() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-blue-600">1.2GB</div>
          <div className="text-sm text-gray-600">DB Size</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-green-600">234ms</div>
          <div className="text-sm text-gray-600">Avg Query</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Active Connections</span>
          <span className="font-medium">12/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Cache Hit Rate</span>
          <span className="font-medium text-green-600">98.5%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Slow Queries</span>
          <span className="font-medium text-yellow-600">3</span>
        </div>
      </div>
    </div>
  )
}

// エラーログリスト
function ErrorLogsList() {
  const errors = [
    {
      time: '2 min ago',
      level: 'ERROR',
      message: 'Database connection timeout',
      count: 1,
    },
    {
      time: '15 min ago',
      level: 'WARN',
      message: 'High memory usage detected',
      count: 1,
    },
    {
      time: '1 hour ago',
      level: 'ERROR',
      message: 'API rate limit exceeded',
      count: 5,
    },
  ]

  const levelColors = {
    ERROR: 'text-red-600 bg-red-100',
    WARN: 'text-yellow-600 bg-yellow-100',
    INFO: 'text-blue-600 bg-blue-100',
  }

  return (
    <div className="space-y-3">
      {errors.map((error, index) => (
        <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${levelColors[error.level as keyof typeof levelColors]}`}
              >
                {error.level}
              </div>
              <p className="text-sm text-gray-900 mt-1">{error.message}</p>
              <p className="text-xs text-gray-500">{error.time}</p>
            </div>
            {error.count > 1 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {error.count}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// アクティブアラート
function ActiveAlerts() {
  const alerts = [
    {
      title: 'High CPU Usage',
      description: 'CPU usage above 80% for 5 minutes',
      severity: 'high',
      time: '5 min ago',
    },
    {
      title: 'Disk Space Low',
      description: 'Available disk space below 15%',
      severity: 'medium',
      time: '12 min ago',
    },
  ]

  const severityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-blue-200 bg-blue-50',
  }

  return (
    <div className="space-y-3">
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <div>No active alerts</div>
        </div>
      ) : (
        alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-3 rounded border ${severityColors[alert.severity as keyof typeof severityColors]}`}
          >
            <div className="font-medium text-gray-900">{alert.title}</div>
            <div className="text-sm text-gray-600 mt-1">
              {alert.description}
            </div>
            <div className="text-xs text-gray-500 mt-2">{alert.time}</div>
          </div>
        ))
      )}
    </div>
  )
}

// トラフィック分析
function TrafficAnalysis() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Unique Visitors</span>
          <span className="font-medium">2,847</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Page Views</span>
          <span className="font-medium">12,459</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Avg Session</span>
          <span className="font-medium">4m 32s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Bounce Rate</span>
          <span className="font-medium">24%</span>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium text-gray-900 mb-2">Top Pages</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">/feed</span>
            <span>4,234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">/workouts</span>
            <span>2,891</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">/profile</span>
            <span>1,567</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// システムヘルスチェック
function SystemHealthCheck() {
  const healthChecks = [
    { name: 'Database', status: 'healthy', responseTime: '12ms' },
    { name: 'Redis', status: 'healthy', responseTime: '3ms' },
    { name: 'API Server', status: 'healthy', responseTime: '45ms' },
    { name: 'File Storage', status: 'warning', responseTime: '156ms' },
    { name: 'External APIs', status: 'healthy', responseTime: '234ms' },
  ]

  const statusColors = {
    healthy: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
  }

  const statusIcons = {
    healthy: '✅',
    warning: '⚠️',
    error: '❌',
  }

  return (
    <div className="space-y-3">
      {healthChecks.map((check) => (
        <div key={check.name} className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">
              {statusIcons[check.status as keyof typeof statusIcons]}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {check.name}
            </span>
          </div>
          <div className="text-right">
            <div
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[check.status as keyof typeof statusColors]}`}
            >
              {check.status}
            </div>
            <div className="text-xs text-gray-500">{check.responseTime}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
