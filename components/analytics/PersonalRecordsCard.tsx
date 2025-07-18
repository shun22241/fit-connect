'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, TrendingUp, Calendar, Plus } from 'lucide-react'

interface PersonalRecord {
  id: string
  exercise: string
  weight: number
  reps: number
  oneRepMax: number
  date: string
  improvement: number
  category: string
}

interface PersonalRecordsCardProps {
  className?: string
}

export default function PersonalRecordsCard({
  className,
}: PersonalRecordsCardProps) {
  const [records, setRecords] = useState<PersonalRecord[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // モックデータ - 実際のアプリでは API から取得
  const mockRecords: PersonalRecord[] = [
    {
      id: '1',
      exercise: 'ベンチプレス',
      weight: 90,
      reps: 1,
      oneRepMax: 90,
      date: '2025-01-15',
      improvement: 5,
      category: '胸',
    },
    {
      id: '2',
      exercise: 'スクワット',
      weight: 110,
      reps: 1,
      oneRepMax: 110,
      date: '2025-01-12',
      improvement: 10,
      category: '脚',
    },
    {
      id: '3',
      exercise: 'デッドリフト',
      weight: 125,
      reps: 1,
      oneRepMax: 125,
      date: '2025-01-08',
      improvement: 5,
      category: '背中',
    },
    {
      id: '4',
      exercise: 'ショルダープレス',
      weight: 45,
      reps: 1,
      oneRepMax: 45,
      date: '2025-01-10',
      improvement: 3,
      category: '肩',
    },
    {
      id: '5',
      exercise: 'バーベルロウ',
      weight: 75,
      reps: 1,
      oneRepMax: 75,
      date: '2025-01-06',
      improvement: 8,
      category: '背中',
    },
    {
      id: '6',
      exercise: 'インクラインベンチプレス',
      weight: 70,
      reps: 1,
      oneRepMax: 70,
      date: '2025-01-14',
      improvement: 5,
      category: '胸',
    },
  ]

  const categories = ['all', '胸', '背中', '脚', '肩', '腕']

  useEffect(() => {
    // 実際のアプリでは API からデータを取得
    setRecords(mockRecords)
  }, [mockRecords])

  const filteredRecords =
    selectedCategory === 'all'
      ? records
      : records.filter((record) => record.category === selectedCategory)

  const calculateStrengthScore = (records: PersonalRecord[]) => {
    const benchPress =
      records.find((r) => r.exercise === 'ベンチプレス')?.oneRepMax || 0
    const squat =
      records.find((r) => r.exercise === 'スクワット')?.oneRepMax || 0
    const deadlift =
      records.find((r) => r.exercise === 'デッドリフト')?.oneRepMax || 0

    return benchPress + squat + deadlift
  }

  const recentRecords = records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 総合スコアカード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
            ストレングス総合スコア
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {calculateStrengthScore(records)}kg
            </div>
            <p className="text-sm text-gray-600 mb-4">
              ベンチプレス + スクワット + デッドリフト
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {records.find((r) => r.exercise === 'ベンチプレス')
                    ?.oneRepMax || 0}
                  kg
                </div>
                <div className="text-xs text-gray-500">ベンチ</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {records.find((r) => r.exercise === 'スクワット')
                    ?.oneRepMax || 0}
                  kg
                </div>
                <div className="text-xs text-gray-500">スクワット</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {records.find((r) => r.exercise === 'デッドリフト')
                    ?.oneRepMax || 0}
                  kg
                </div>
                <div className="text-xs text-gray-500">デッドリフト</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近の記録 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
            最近の新記録
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{record.exercise}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{record.weight}kg</div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    +{record.improvement}kg
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別記録 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              パーソナルレコード一覧
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              記録追加
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* カテゴリフィルター */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? '全て' : category}
              </Button>
            ))}
          </div>

          {/* 記録リスト */}
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                記録がありません
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{record.exercise}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {record.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {record.weight}kg
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.reps === 1 ? '1RM' : `${record.reps}回`}
                    </div>
                    {record.improvement > 0 && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600 mt-1"
                      >
                        +{record.improvement}kg
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
