'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import ExerciseForm from '@/components/workouts/ExerciseForm'
import { useWorkouts } from '@/hooks/useWorkouts'
import { CreateWorkoutData } from '@/types/database'
import { Plus, Edit, Trash2, Clock, Target } from 'lucide-react'

interface ExerciseData {
  exerciseName: string
  sets: number
  reps: number[]
  weights: number[]
  restSeconds: number[]
}

export default function NewWorkoutPage() {
  const router = useRouter()
  const { createWorkout } = useWorkouts()

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState<number | undefined>()
  const [exercises, setExercises] = useState<ExerciseData[]>([])
  const [editingExercise, setEditingExercise] = useState<{
    index: number
    exercise: ExerciseData
  } | null>(null)
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddExercise = (exercise: ExerciseData) => {
    setExercises([...exercises, exercise])
    setShowExerciseForm(false)
  }

  const handleEditExercise = (exercise: ExerciseData) => {
    if (editingExercise) {
      const updatedExercises = [...exercises]
      updatedExercises[editingExercise.index] = exercise
      setExercises(updatedExercises)
      setEditingExercise(null)
    }
  }

  const handleDeleteExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || exercises.length === 0) {
      alert('ワークアウト名とエクササイズを入力してください')
      return
    }

    setLoading(true)

    try {
      const workoutData: CreateWorkoutData = {
        name: name.trim(),
        notes: notes.trim() || undefined,
        duration,
        exercises,
      }

      await createWorkout(workoutData)
      router.push('/workouts')
    } catch (error) {
      console.error('Error creating workout:', error)
      alert('ワークアウトの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const totalVolume = exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.weights.reduce(
        (sum, weight, i) => sum + weight * exercise.reps[i],
        0,
      )
    )
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            新しいワークアウト
          </h1>
          <p className="mt-2 text-gray-600">
            今日のトレーニングを記録しましょう
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ワークアウト名 *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="例: 胸・三頭筋トレーニング"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">時間 (分)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="90"
                    value={duration || ''}
                    onChange={(e) =>
                      setDuration(parseInt(e.target.value) || undefined)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  placeholder="今日の調子や気づいたことを記録..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* エクササイズリスト */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>エクササイズ ({exercises.length})</CardTitle>
                <Dialog
                  open={showExerciseForm}
                  onOpenChange={setShowExerciseForm}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      エクササイズ追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <ExerciseForm
                      onSave={handleAddExercise}
                      onCancel={() => setShowExerciseForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {exercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>まだエクササイズが追加されていません</p>
                  <p className="text-sm">
                    「エクササイズ追加」ボタンから始めましょう
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {exercise.exerciseName}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>{exercise.sets} セット</span>
                            <span>
                              総重量:{' '}
                              {exercise.weights
                                .reduce(
                                  (sum, weight, i) =>
                                    sum + weight * exercise.reps[i],
                                  0,
                                )
                                .toFixed(1)}
                              kg
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog
                            open={editingExercise?.index === index}
                            onOpenChange={(open) => {
                              if (!open) setEditingExercise(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEditingExercise({ index, exercise })
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <ExerciseForm
                                exercise={exercise}
                                onSave={handleEditExercise}
                                onCancel={() => setEditingExercise(null)}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExercise(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {exercise.reps.map((rep, setIndex) => (
                          <Badge
                            key={setIndex}
                            variant="outline"
                            className="justify-center py-2"
                          >
                            Set {setIndex + 1}: {rep}回 ×{' '}
                            {exercise.weights[setIndex]}kg
                            {exercise.restSeconds[setIndex] > 0 && (
                              <span className="ml-2 text-xs opacity-75">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {exercise.restSeconds[setIndex]}s
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* サマリー */}
          {exercises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>サマリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {exercises.length}
                    </div>
                    <div className="text-sm text-gray-600">エクササイズ</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {exercises.reduce((total, ex) => total + ex.sets, 0)}
                    </div>
                    <div className="text-sm text-gray-600">総セット数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {totalVolume.toFixed(1)}kg
                    </div>
                    <div className="text-sm text-gray-600">総重量</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {duration || '-'}
                    </div>
                    <div className="text-sm text-gray-600">時間 (分)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 保存ボタン */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !name.trim() || exercises.length === 0}
            >
              {loading ? 'ワークアウトを保存中...' : 'ワークアウトを保存'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
