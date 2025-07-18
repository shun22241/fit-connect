'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dumbbell,
  Brain,
  Clock,
  Target,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface Exercise {
  name: string
  sets: number
  reps: string
  weight: string
  notes: string
}

interface WorkoutRecommendation {
  title: string
  description: string
  duration: number
  exercises: Exercise[]
  tips: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface WorkoutRecommendationCardProps {
  className?: string
}

export default function WorkoutRecommendationCard({
  className,
}: WorkoutRecommendationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [recommendation, setRecommendation] =
    useState<WorkoutRecommendation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userInput, setUserInput] = useState('')

  // デフォルト設定
  const [fitnessLevel, setFitnessLevel] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('intermediate')
  const [goals, setGoals] = useState<string[]>(['筋力向上'])
  const [equipment, setEquipment] = useState<string[]>(['ダンベル', 'バーベル'])
  const [timeAvailable, setTimeAvailable] = useState(45)

  const handleGetRecommendation = async (quick = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const endpoint = '/api/ai/workout-recommendation'
      const url = quick ? `${endpoint}?quick=true` : endpoint

      const response = await fetch(url, {
        method: quick ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: quick
          ? undefined
          : JSON.stringify({
              fitnessLevel,
              goals,
              equipment,
              timeAvailable,
            }),
      })

      if (!response.ok) {
        throw new Error('推奨を取得できませんでした')
      }

      const data = await response.json()
      if (data.success) {
        setRecommendation(data.recommendation)
      } else {
        throw new Error(data.error || '推奨の生成に失敗しました')
      }
    } catch (error) {
      console.error('Error getting workout recommendation:', error)
      setError(
        error instanceof Error
          ? error.message
          : '予期しないエラーが発生しました',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleNaturalLanguageParse = async () => {
    if (!userInput.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/parse-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput }),
      })

      if (!response.ok) {
        throw new Error('ワークアウトの解析に失敗しました')
      }

      const data = await response.json()
      if (data.success) {
        // 解析結果を推奨形式に変換
        const parsedWorkout: WorkoutRecommendation = {
          title: data.parsed.title,
          description: `自然言語から解析されたワークアウト: ${data.parsed.notes}`,
          duration: data.parsed.total_duration,
          exercises: data.parsed.exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps?.toString() || '1',
            weight: ex.weight ? `${ex.weight}kg` : '自重',
            notes: ex.duration ? `${ex.duration}秒` : '',
          })),
          tips: ['自然言語から解析されました', '詳細を確認してください'],
          difficulty: 'intermediate' as const,
        }
        setRecommendation(parsedWorkout)
        setUserInput('')
      } else {
        throw new Error(data.error || '解析に失敗しました')
      }
    } catch (error) {
      console.error('Error parsing workout:', error)
      setError(
        error instanceof Error
          ? error.message
          : '予期しないエラーが発生しました',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '初心者'
      case 'intermediate':
        return '中級者'
      case 'advanced':
        return '上級者'
      default:
        return difficulty
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-purple-600" />
          AI ワークアウト推奨
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* クイック推奨ボタン */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">クイック推奨</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              onClick={() => handleGetRecommendation(true)}
              disabled={isLoading}
              variant="outline"
              className="justify-start"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              今すぐ推奨を取得
            </Button>
            <Button
              onClick={() => handleGetRecommendation(false)}
              disabled={isLoading}
              variant="outline"
              className="justify-start"
            >
              <Target className="mr-2 h-4 w-4" />
              カスタム推奨
            </Button>
          </div>
        </div>

        {/* 自然言語入力 */}
        <div className="space-y-3">
          <Label htmlFor="natural-input">自然言語でワークアウトを記録</Label>
          <Textarea
            id="natural-input"
            placeholder="例: 今日は胸トレをしました。ベンチプレス 80kg 10回を3セット、プッシュアップ 15回を2セットやりました。"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={handleNaturalLanguageParse}
            disabled={isLoading || !userInput.trim()}
            variant="outline"
            size="sm"
          >
            <Brain className="mr-2 h-4 w-4" />
            解析する
          </Button>
        </div>

        {/* ローディング状態 */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-600">AI が推奨を生成中...</span>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* 推奨結果表示 */}
        {recommendation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{recommendation.title}</h3>
              <Badge className={getDifficultyColor(recommendation.difficulty)}>
                {getDifficultyLabel(recommendation.difficulty)}
              </Badge>
            </div>

            <p className="text-sm text-gray-600">
              {recommendation.description}
            </p>

            {/* ワークアウト情報 */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {recommendation.duration}分
              </div>
              <div className="flex items-center">
                <Dumbbell className="mr-1 h-4 w-4" />
                {recommendation.exercises.length}種目
              </div>
            </div>

            {/* エクササイズリスト */}
            <div className="space-y-3">
              <h4 className="font-medium">エクササイズ</h4>
              <div className="space-y-2">
                {recommendation.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{exercise.name}</h5>
                      <span className="text-sm text-gray-500">
                        {exercise.sets}セット × {exercise.reps}
                      </span>
                    </div>
                    {exercise.weight && (
                      <div className="text-sm text-gray-600">
                        重量: {exercise.weight}
                      </div>
                    )}
                    {exercise.notes && (
                      <div className="text-sm text-gray-600">
                        <strong>ポイント:</strong> {exercise.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* アドバイス */}
            {recommendation.tips.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                  アドバイス
                </h4>
                <ul className="space-y-1">
                  {recommendation.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start"
                    >
                      <span className="text-green-500 mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Dumbbell className="mr-2 h-4 w-4" />
                このワークアウトを開始
              </Button>
              <Button size="sm" variant="outline">
                保存
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
