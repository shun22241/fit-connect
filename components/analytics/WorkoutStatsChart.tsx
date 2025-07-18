'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Calendar, Target, Activity, RefreshCw } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

interface WorkoutStatsChartProps {
  className?: string
}

export default function WorkoutStatsChart({
  className,
}: WorkoutStatsChartProps) {
  // モックデータ - 実際のアプリでは実際のワークアウトデータを使用
  const weeklyProgressData = {
    labels: ['月', '火', '水', '木', '金', '土', '日'],
    datasets: [
      {
        label: '総重量 (kg)',
        data: [2450, 0, 3200, 0, 2800, 4100, 2950],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'トレーニング時間 (分)',
        data: [65, 0, 75, 0, 60, 80, 70],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }

  const monthlyVolumeData = {
    labels: ['1週目', '2週目', '3週目', '4週目'],
    datasets: [
      {
        label: '週間総重量 (kg)',
        data: [8650, 9200, 11300, 10450],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(251, 146, 60)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const exerciseDistributionData = {
    labels: ['胸', '背中', '脚', '肩', '腕', '有酸素'],
    datasets: [
      {
        data: [25, 22, 20, 15, 12, 6],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(251, 146, 60)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: '週間進捗',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '総重量 (kg)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '時間 (分)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const barOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '月間重量推移',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '総重量 (kg)',
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '部位別トレーニング分布',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const stats = [
    {
      title: '今週の総重量',
      value: '12,550kg',
      change: '+15%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'トレーニング日数',
      value: '4日',
      change: '目標達成',
      trend: 'up',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: '平均セッション時間',
      value: '67分',
      change: '+8分',
      trend: 'up',
      icon: Activity,
      color: 'text-purple-600',
    },
    {
      title: '目標達成率',
      value: '85%',
      change: '+10%',
      trend: 'up',
      icon: Target,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${stat.color} border-current`}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 週間進捗ライン chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              週間進捗トレンド
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={weeklyProgressData} options={lineOptions} />
            </div>
          </CardContent>
        </Card>

        {/* 月間重量推移バーチャート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-600" />
              月間重量推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={monthlyVolumeData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 部位別分布ドーナツチャート */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-purple-600" />
              部位別分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={exerciseDistributionData}
                options={doughnutOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* 詳細統計 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>詳細分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">今月のハイライト</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ベンチプレス: 85kg → 90kg（+5kg）</li>
                    <li>• スクワット: 100kg → 110kg（+10kg）</li>
                    <li>• デッドリフト: 120kg → 125kg（+5kg）</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">改善点</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 有酸素運動の頻度を増やす</li>
                    <li>• 肩のトレーニングを強化</li>
                    <li>• 休息日の適切な管理</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">次週の目標</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Badge variant="outline" className="justify-center">
                    週4回トレーニング
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    総重量 13,000kg
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    新種目チャレンジ
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
