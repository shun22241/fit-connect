'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWorkout } from '@/hooks/useWorkouts'
import { formatDistance, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  User,
  Dumbbell,
  Edit,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

export default function WorkoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string
  const { workout, loading, error } = useWorkout(workoutId)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">ワークアウトを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">ワークアウトが見つかりません</p>
            <Link href="/workouts">
              <Button className="mt-4">ワークアウト一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalSets = workout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets,
    0,
  )
  const totalVolume = workout.exercises.reduce((sum, exercise) => {
    return (
      sum +
      exercise.weights.reduce(
        (volSum, weight, i) => volSum + weight * exercise.reps[i],
        0,
      )
    )
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{workout.name}</h1>
            <p className="text-gray-600 mt-1">
              {format(new Date(workout.completedAt), 'yyyy年MM月dd日 HH:mm', {
                locale: ja,
              })}
              <span className="ml-2">
                (
                {formatDistance(new Date(workout.completedAt), new Date(), {
                  addSuffix: true,
                  locale: ja,
                })}
                )
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    エクササイズ数
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workout.exercises.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full">
                  <Dumbbell className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    総セット数
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalSets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総重量</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalVolume.toFixed(1)}kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">時間</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workout.duration ? `${workout.duration}分` : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メモ */}
        {workout.notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>メモ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {workout.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* エクササイズ詳細 */}
        <Card>
          <CardHeader>
            <CardTitle>エクササイズ詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {workout.exercises.map((exercise, index) => {
                const exerciseVolume = exercise.weights.reduce(
                  (sum, weight, i) => sum + weight * exercise.reps[i],
                  0,
                )

                return (
                  <div key={exercise.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {index + 1}. {exercise.exerciseName}
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span>{exercise.sets} セット</span>
                          <span>重量: {exerciseVolume.toFixed(1)}kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">セット</th>
                            <th className="text-center py-2 px-3">レップ数</th>
                            <th className="text-center py-2 px-3">重量 (kg)</th>
                            <th className="text-center py-2 px-3">
                              ボリューム
                            </th>
                            <th className="text-center py-2 px-3">休憩 (秒)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.reps.map((rep, setIndex) => (
                            <tr
                              key={setIndex}
                              className="border-b last:border-b-0"
                            >
                              <td className="py-2 px-3">
                                <Badge variant="outline">
                                  Set {setIndex + 1}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-center font-medium">
                                {rep}
                              </td>
                              <td className="py-2 px-3 text-center font-medium">
                                {exercise.weights[setIndex]}
                              </td>
                              <td className="py-2 px-3 text-center text-blue-600 font-medium">
                                {(rep * exercise.weights[setIndex]).toFixed(1)}
                                kg
                              </td>
                              <td className="py-2 px-3 text-center text-gray-600">
                                {exercise.restSeconds[setIndex] || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* アクション */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            このワークアウトを編集
          </Button>
          <Button variant="outline" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            このワークアウトを再実行
          </Button>
        </div>
      </div>
    </div>
  )
}
