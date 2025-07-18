'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  MessageCircle,
  Brain,
  TrendingUp,
  Target,
  RefreshCw,
  Heart,
  Lightbulb,
  Star,
  AlertCircle,
} from 'lucide-react'

interface CoachingAdvice {
  motivation: string
  progress_analysis: string
  recommendations: string[]
  next_steps: string[]
  encouragement: string
}

interface AICoachingCardProps {
  className?: string
}

export default function AICoachingCard({ className }: AICoachingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [advice, setAdvice] = useState<CoachingAdvice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [challenges, setChallenges] = useState('')
  const [goals, setGoals] = useState('')

  // モックデータ - 実際のアプリでは実際のワークアウト履歴を使用
  const mockWorkoutHistory = [
    { date: '2025-01-15', type: '胸・三頭筋', duration: 65, exercises: 8 },
    { date: '2025-01-13', type: '背中・二頭筋', duration: 70, exercises: 7 },
    { date: '2025-01-11', type: '脚', duration: 55, exercises: 6 },
    { date: '2025-01-09', type: '肩・腹筋', duration: 45, exercises: 5 },
    { date: '2025-01-07', type: '全身', duration: 60, exercises: 9 },
  ]

  const handleGetCoaching = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const goalsList = goals
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g)
      const challengesList = challenges
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c)

      const response = await fetch('/api/ai/coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutHistory: mockWorkoutHistory,
          currentGoals:
            goalsList.length > 0 ? goalsList : ['筋力向上', '体脂肪減少'],
          challenges: challengesList.length > 0 ? challengesList : ['時間不足'],
        }),
      })

      if (!response.ok) {
        throw new Error('コーチングアドバイスを取得できませんでした')
      }

      const data = await response.json()
      if (data.success) {
        setAdvice(data.advice)
      } else {
        throw new Error(data.error || 'アドバイスの生成に失敗しました')
      }
    } catch (error) {
      console.error('Error getting coaching advice:', error)
      setError(
        error instanceof Error
          ? error.message
          : '予期しないエラーが発生しました',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-blue-600" />
          AI パーソナルコーチ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 入力フォーム */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goals">現在の目標（カンマ区切り）</Label>
            <Textarea
              id="goals"
              placeholder="例: 筋力向上, 体脂肪減少, 持久力向上"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">現在の課題や悩み（カンマ区切り）</Label>
            <Textarea
              id="challenges"
              placeholder="例: 時間不足, モチベーション維持, 正しいフォーム"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <Button
            onClick={handleGetCoaching}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                コーチからのアドバイスを取得中...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                パーソナルアドバイスを取得
              </>
            )}
          </Button>
        </div>

        {/* ワークアウト履歴概要 */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <TrendingUp className="mr-1 h-4 w-4" />
            最近のワークアウト履歴
          </h4>
          <div className="space-y-1 text-sm text-blue-800">
            {mockWorkoutHistory.slice(0, 3).map((workout, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  {workout.date}: {workout.type}
                </span>
                <span>{workout.duration}分</span>
              </div>
            ))}
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* アドバイス表示 */}
        {advice && (
          <div className="space-y-4">
            {/* モチベーションメッセージ */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-blue-900">
                  今日のモチベーション
                </h3>
              </div>
              <p className="text-blue-800">{advice.motivation}</p>
            </div>

            {/* 進捗分析 */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                進捗分析
              </h4>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {advice.progress_analysis}
              </p>
            </div>

            {/* 推奨事項 */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Lightbulb className="mr-1 h-4 w-4 text-yellow-500" />
                推奨事項
              </h4>
              <ul className="space-y-1">
                {advice.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start p-2 bg-yellow-50 rounded"
                  >
                    <span className="text-yellow-500 mr-2">💡</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* 次のステップ */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Target className="mr-1 h-4 w-4 text-purple-500" />
                次のステップ
              </h4>
              <ul className="space-y-1">
                {advice.next_steps.map((step, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start p-2 bg-purple-50 rounded"
                  >
                    <span className="text-purple-500 mr-2">🎯</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* 励ましメッセージ */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-green-900">
                  コーチからのエール
                </h3>
              </div>
              <p className="text-green-800 font-medium">
                {advice.encouragement}
              </p>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                アドバイスを保存
              </Button>
              <Button size="sm" className="flex-1">
                新しいワークアウトを開始
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
