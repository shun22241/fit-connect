'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Search,
  CheckCircle,
  AlertTriangle,
  Shield,
  Lightbulb,
  RefreshCw,
  Star,
  AlertCircle,
} from 'lucide-react'

interface FormAnalysis {
  analysis: string
  improvements: string[]
  tips: string[]
  safety: string[]
  score: number
}

interface FormAnalysisCardProps {
  className?: string
}

export default function FormAnalysisCard({ className }: FormAnalysisCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exerciseName, setExerciseName] = useState('')
  const [userDescription, setUserDescription] = useState('')

  const handleAnalyzeForm = async () => {
    if (!exerciseName.trim() || !userDescription.trim()) {
      setError('エクササイズ名と状況説明の両方を入力してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/form-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseName: exerciseName.trim(),
          userDescription: userDescription.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('フォーム解析を取得できませんでした')
      }

      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        throw new Error(data.error || '解析に失敗しました')
      }
    } catch (error) {
      console.error('Error analyzing form:', error)
      setError(
        error instanceof Error
          ? error.message
          : '予期しないエラーが発生しました',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return '優秀'
    if (score >= 6) return '良好'
    if (score >= 4) return '改善必要'
    return '要注意'
  }

  // よくあるエクササイズの例
  const commonExercises = [
    'ベンチプレス',
    'スクワット',
    'デッドリフト',
    'プッシュアップ',
    'プルアップ',
    'ショルダープレス',
    'バーベルカール',
    'ディップス',
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="mr-2 h-5 w-5 text-green-600" />
          AI フォーム解析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 入力フォーム */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">エクササイズ名</Label>
            <input
              id="exercise-name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: ベンチプレス"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              list="exercise-suggestions"
            />
            <datalist id="exercise-suggestions">
              {commonExercises.map((exercise) => (
                <option key={exercise} value={exercise} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-description">現在の状況やフォームの悩み</Label>
            <Textarea
              id="user-description"
              placeholder="例: 重量を上げると肩が痛くなることがあります。バーを胸の下まで下ろせているかも不安です。正しいフォームを教えてください。"
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleAnalyzeForm}
            disabled={
              isLoading || !exerciseName.trim() || !userDescription.trim()
            }
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                フォームを解析中...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                フォームを解析する
              </>
            )}
          </Button>
        </div>

        {/* 使用例 */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 使用例</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>エクササイズ:</strong> スクワット
            </p>
            <p>
              <strong>状況:</strong>{' '}
              膝が内側に入ってしまい、太ももの前側ばかり疲れます。正しいフォームと意識するポイントを教えてください。
            </p>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* 解析結果表示 */}
        {analysis && (
          <div className="space-y-4">
            {/* スコア表示 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">フォーム評価</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getScoreColor(analysis.score)}>
                  {analysis.score}/10
                </Badge>
                <Badge variant="outline">{getScoreLabel(analysis.score)}</Badge>
              </div>
            </div>

            {/* 分析結果 */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <CheckCircle className="mr-1 h-4 w-4 text-blue-500" />
                フォーム分析
              </h4>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {analysis.analysis}
              </p>
            </div>

            {/* 改善点 */}
            {analysis.improvements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <AlertTriangle className="mr-1 h-4 w-4 text-orange-500" />
                  改善点
                </h4>
                <ul className="space-y-1">
                  {analysis.improvements.map((improvement, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start p-2 bg-orange-50 rounded"
                    >
                      <span className="text-orange-500 mr-2">⚠️</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* コツ・アドバイス */}
            {analysis.tips.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <Lightbulb className="mr-1 h-4 w-4 text-yellow-500" />
                  コツ・アドバイス
                </h4>
                <ul className="space-y-1">
                  {analysis.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start p-2 bg-yellow-50 rounded"
                    >
                      <span className="text-yellow-500 mr-2">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 安全上の注意 */}
            {analysis.safety.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <Shield className="mr-1 h-4 w-4 text-red-500" />
                  安全上の注意
                </h4>
                <ul className="space-y-1">
                  {analysis.safety.map((safety, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start p-2 bg-red-50 rounded"
                    >
                      <span className="text-red-500 mr-2">🛡️</span>
                      {safety}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 総評 */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-green-900">総評</h3>
              </div>
              <p className="text-green-800">
                {analysis.score >= 8 &&
                  '素晴らしいフォームです！この調子で続けてください。'}
                {analysis.score >= 6 &&
                  analysis.score < 8 &&
                  '良いフォームですが、いくつかの改善点があります。'}
                {analysis.score < 6 &&
                  'フォームに改善の余地があります。安全性を重視して練習を続けてください。'}
              </p>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                解析結果を保存
              </Button>
              <Button size="sm" className="flex-1">
                ワークアウトに記録
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
