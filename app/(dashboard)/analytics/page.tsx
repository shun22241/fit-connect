'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import WorkoutStatsChart from '@/components/analytics/WorkoutStatsChart'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  Download,
  RefreshCw,
  Trophy,
  Zap,
} from 'lucide-react'

interface PersonalRecord {
  exercise: string
  weight: number
  date: string
  improvement: number
}

interface Goal {
  name: string
  current: number
  target: number
  unit: string
  deadline: string
  progress: number
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // モックデータ - 実際のアプリでは API から取得
  const personalRecords: PersonalRecord[] = [
    {
      exercise: 'ベンチプレス',
      weight: 90,
      date: '2025-01-15',
      improvement: 5,
    },
    {
      exercise: 'スクワット',
      weight: 110,
      date: '2025-01-12',
      improvement: 10,
    },
    {
      exercise: 'デッドリフト',
      weight: 125,
      date: '2025-01-08',
      improvement: 5,
    },
    {
      exercise: '懸垂',
      weight: 15,
      date: '2025-01-10',
      improvement: 3,
    },
  ]

  const goals: Goal[] = [
    {
      name: 'ベンチプレス 100kg',
      current: 90,
      target: 100,
      unit: 'kg',
      deadline: '2025-03-01',
      progress: 90,
    },
    {
      name: '週4回トレーニング',
      current: 3,
      target: 4,
      unit: '回/週',
      deadline: '2025-02-28',
      progress: 75,
    },
    {
      name: '体重 75kg',
      current: 78,
      target: 75,
      unit: 'kg',
      deadline: '2025-04-01',
      progress: 60,
    },
  ]

  const refreshData = async () => {
    setIsLoading(true)
    // 実際のアプリでは API からデータを再取得
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  const exportData = () => {
    // CSV エクスポート機能の実装
    console.log('データをエクスポート中...')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ワークアウト分析</h1>
          <p className="text-gray-600 mt-1">
            最終更新: {lastUpdated.toLocaleDateString('ja-JP')}{' '}
            {lastUpdated.toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            更新
          </Button>
          <Button
            variant="outline"
            onClick={exportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            エクスポート
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            概要
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            進捗
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            記録
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            目標
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkoutStatsChart />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  月間進捗サマリー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      ワークアウト回数
                    </span>
                    <span className="font-semibold">12回</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">総重量</span>
                    <span className="font-semibold">42,500kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      平均セッション時間
                    </span>
                    <span className="font-semibold">67分</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">継続率</span>
                    <span className="font-semibold text-green-600">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-orange-600" />
                  今月のハイライト
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">新記録達成</span>
                    <Badge variant="secondary">3回</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">連続ワークアウト</span>
                    <Badge variant="secondary">5日</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">目標達成</span>
                    <Badge variant="secondary">2/3</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      素晴らしい進歩です！特にベンチプレスとスクワットで大きな成長が見られます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
                パーソナルレコード
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalRecords.map((record, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{record.exercise}</h4>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        +{record.improvement}kg
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {record.weight}kg
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-purple-600" />
                目標追跡
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {goals.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.name}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(goal.deadline).toLocaleDateString('ja-JP')}
                        まで
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      進捗: {goal.progress}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>目標設定のヒント</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">SMART目標設定</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 具体的（Specific）</li>
                    <li>• 測定可能（Measurable）</li>
                    <li>• 達成可能（Achievable）</li>
                    <li>• 関連性（Relevant）</li>
                    <li>• 期限付き（Time-bound）</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">推奨目標例</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 週3回、30分以上のトレーニング</li>
                    <li>• 主要種目の重量を月5kg向上</li>
                    <li>• 体脂肪率を3ヶ月で2%減少</li>
                    <li>• 新しいエクササイズを月2種目習得</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
