'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus } from 'lucide-react'

interface ExerciseData {
  exerciseName: string
  sets: number
  reps: number[]
  weights: number[]
  restSeconds: number[]
}

interface ExerciseFormProps {
  exercise?: ExerciseData
  onSave: (exercise: ExerciseData) => void
  onCancel: () => void
}

export default function ExerciseForm({
  exercise,
  onSave,
  onCancel,
}: ExerciseFormProps) {
  const [exerciseName, setExerciseName] = useState(exercise?.exerciseName || '')
  const [sets, setSets] = useState<
    Array<{
      reps: number
      weight: number
      restSeconds: number
    }>
  >(
    exercise
      ? exercise.reps.map((rep, i) => ({
          reps: rep,
          weight: exercise.weights[i] || 0,
          restSeconds: exercise.restSeconds[i] || 0,
        }))
      : [{ reps: 0, weight: 0, restSeconds: 0 }],
  )

  const addSet = () => {
    setSets([...sets, { reps: 0, weight: 0, restSeconds: 0 }])
  }

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index))
    }
  }

  const updateSet = (
    index: number,
    field: keyof (typeof sets)[0],
    value: number,
  ) => {
    const updatedSets = [...sets]
    updatedSets[index][field] = value
    setSets(updatedSets)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!exerciseName.trim()) return

    const exerciseData: ExerciseData = {
      exerciseName: exerciseName.trim(),
      sets: sets.length,
      reps: sets.map((set) => set.reps),
      weights: sets.map((set) => set.weight),
      restSeconds: sets.map((set) => set.restSeconds),
    }

    onSave(exerciseData)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {exercise ? 'エクササイズを編集' : '新しいエクササイズを追加'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="exerciseName">エクササイズ名</Label>
            <Input
              id="exerciseName"
              type="text"
              placeholder="例: ベンチプレス"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">セット詳細</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSet}
              >
                <Plus className="h-4 w-4 mr-2" />
                セット追加
              </Button>
            </div>

            <div className="space-y-3">
              {sets.map((set, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <Badge variant="secondary" className="min-w-[60px]">
                    Set {index + 1}
                  </Badge>

                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">レップ数</Label>
                      <Input
                        type="number"
                        min="0"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(
                            index,
                            'reps',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">重量 (kg)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(
                            index,
                            'weight',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">休憩 (秒)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={set.restSeconds}
                        onChange={(e) =>
                          updateSet(
                            index,
                            'restSeconds',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {sets.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSet(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {exercise ? '更新' : '追加'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
