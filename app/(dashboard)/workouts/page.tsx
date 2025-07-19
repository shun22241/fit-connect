'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PullToRefresh from '@/components/ui/PullToRefresh'
import { useWorkouts } from '@/hooks/useWorkouts'
import { formatDistance } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Plus,
  Calendar,
  Clock,
  Target,
  Dumbbell,
  TrendingUp,
} from 'lucide-react'

export default function WorkoutsPage() {
  const { workouts, loading, error, refetch } = useWorkouts()
  const [filter, setFilter] = useState<'all' | 'thisWeek' | 'thisMonth'>('all')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">ワークアウトを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">エラーが発生しました: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  const getFilteredWorkouts = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (filter) {
      case 'thisWeek':
        return workouts.filter(
          (workout) => new Date(workout.completedAt) >= oneWeekAgo,
        )
      case 'thisMonth':
        return workouts.filter(
          (workout) => new Date(workout.completedAt) >= oneMonthAgo,
        )
      default:
        return workouts
    }
  }

  const filteredWorkouts = getFilteredWorkouts()

  // 統計計算
  const totalWorkouts = workouts.length
  const totalExercises = workouts.reduce(
    (sum, workout) => sum + workout.exercises.length,
    0,
  )
  const totalDuration = workouts.reduce(
    (sum, workout) => sum + (workout.duration || 0),
    0,
  )
  const averageDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    await refetch()
  }

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      className="min-h-screen bg-gray-50"
    >
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ワークアウト履歴
              </h1>
              <p className="mt-2 text-gray-600">
                これまでのトレーニング記録を確認できます
              </p>
            </div>
            <Link href="/workouts/new">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                新しいワークアウト
              </Button>
            </Link>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Dumbbell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      総ワークアウト数
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalWorkouts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      総エクササイズ数
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalExercises}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総時間</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(totalDuration / 60)}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      平均時間
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {averageDuration}分
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* フィルター */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              すべて
            </Button>
            <Button
              variant={filter === 'thisWeek' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('thisWeek')}
            >
              今週
            </Button>
            <Button
              variant={filter === 'thisMonth' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('thisMonth')}
            >
              今月
            </Button>
          </div>

          {/* ワークアウトリスト */}
          {filteredWorkouts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    まだワークアウトがありません
                  </h3>
                  <p className="text-gray-600 mb-6">
                    最初のワークアウトを記録して、フィットネスジャーニーを始めましょう！
                  </p>
                  <Link href="/workouts/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      最初のワークアウトを記録
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredWorkouts.map((workout) => (
                <Card
                  key={workout.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {workout.name}
                          </h3>
                          <Badge variant="secondary">
                            {workout.exercises.length} エクササイズ
                          </Badge>
                          {workout.duration && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {workout.duration}分
                            </Badge>
                          )}
                        </div>

                        {workout.notes && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {workout.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDistance(
                              new Date(workout.completedAt),
                              new Date(),
                              {
                                addSuffix: true,
                                locale: ja,
                              },
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {workout.exercises.reduce(
                              (total: number, exercise: any) => total + exercise.sets,
                              0,
                            )}{' '}
                            セット
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/workouts/${workout.id}`}>
                          <Button variant="outline" size="sm">
                            詳細を見る
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  )
}
