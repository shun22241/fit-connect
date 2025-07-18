'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWorkouts } from '@/hooks/useWorkouts'
import { usePosts } from '@/hooks/usePosts'
import { CreatePostData, WorkoutWithExercises } from '@/types/database'
import { ArrowLeft, Image as ImageIcon, Dumbbell, Hash, X } from 'lucide-react'

export default function NewPostPage() {
  const router = useRouter()
  const { workouts } = useWorkouts()
  const { createPost } = usePosts()

  const [content, setContent] = useState('')
  const [selectedWorkout, setSelectedWorkout] =
    useState<WorkoutWithExercises | null>(null)
  const [hashtags, setHashtags] = useState<string[]>([])
  const [newHashtag, setNewHashtag] = useState('')
  const [loading, setLoading] = useState(false)

  // 最近のワークアウトを取得（直近5件）
  const recentWorkouts = workouts.slice(0, 5)

  const addHashtag = () => {
    const tag = newHashtag.trim().replace('#', '')
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag])
      setNewHashtag('')
    }
  }

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('投稿内容を入力してください')
      return
    }

    setLoading(true)

    try {
      const postData: CreatePostData = {
        content: content.trim(),
        workoutId: selectedWorkout?.id,
        hashtags,
      }

      await createPost(postData)
      router.push('/feed')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('投稿の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const suggestedHashtags = [
    '筋トレ',
    'ワークアウト',
    'フィットネス',
    'ジム',
    '自宅トレ',
    'ベンチプレス',
    'スクワット',
    'デッドリフト',
    '有酸素運動',
    'ダイエット',
    '増量',
    '減量',
    '朝トレ',
    '夜トレ',
    'モチベーション',
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">新しい投稿</h1>
            <p className="text-gray-600 mt-1">
              今日のワークアウトをシェアしましょう
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 投稿内容 */}
          <Card>
            <CardHeader>
              <CardTitle>投稿内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">内容 *</Label>
                <Textarea
                  id="content"
                  placeholder="今日のワークアウトはどうでしたか？感想や成果をシェアしましょう！"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
                <div className="text-right text-sm text-gray-500">
                  {content.length}/1000
                </div>
              </div>

              {/* 画像アップロード（今回は省略） */}
              <div className="space-y-2">
                <Label>画像（今後実装予定）</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>画像アップロード機能は今後実装予定です</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ワークアウト選択 */}
          <Card>
            <CardHeader>
              <CardTitle>ワークアウトを添付（オプション）</CardTitle>
            </CardHeader>
            <CardContent>
              {recentWorkouts.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>まだワークアウト記録がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="radio"
                      id="no-workout"
                      name="workout"
                      checked={!selectedWorkout}
                      onChange={() => setSelectedWorkout(null)}
                    />
                    <label htmlFor="no-workout" className="text-sm">
                      ワークアウトなし
                    </label>
                  </div>

                  {recentWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <input
                        type="radio"
                        id={`workout-${workout.id}`}
                        name="workout"
                        checked={selectedWorkout?.id === workout.id}
                        onChange={() => setSelectedWorkout(workout)}
                      />
                      <label
                        htmlFor={`workout-${workout.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{workout.name}</div>
                        <div className="text-sm text-gray-600">
                          {workout.exercises.length}エクササイズ
                          {workout.duration && ` • ${workout.duration}分`}•{' '}
                          {new Date(workout.completedAt).toLocaleDateString(
                            'ja-JP',
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ハッシュタグ */}
          <Card>
            <CardHeader>
              <CardTitle>ハッシュタグ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 追加されたハッシュタグ */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* ハッシュタグ入力 */}
              <div className="flex gap-2">
                <Input
                  placeholder="ハッシュタグを入力"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addHashtag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addHashtag}>
                  <Hash className="h-4 w-4" />
                </Button>
              </div>

              {/* 推奨ハッシュタグ */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  推奨ハッシュタグ:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags
                    .filter((tag) => !hashtags.includes(tag))
                    .slice(0, 8)
                    .map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!hashtags.includes(tag)) {
                            setHashtags([...hashtags, tag])
                          }
                        }}
                        className="text-xs"
                      >
                        #{tag}
                      </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* プレビュー */}
          {(content || selectedWorkout || hashtags.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>プレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-sm">あなた</div>
                      <div className="text-xs text-gray-500">今</div>
                    </div>
                  </div>

                  {content && (
                    <p className="text-gray-900 mb-3 whitespace-pre-wrap">
                      {content}
                    </p>
                  )}

                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {hashtags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-blue-600"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {selectedWorkout && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {selectedWorkout.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedWorkout.exercises.length}エクササイズ
                        {selectedWorkout.duration &&
                          ` • ${selectedWorkout.duration}分`}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 投稿ボタン */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !content.trim()}
            >
              {loading ? '投稿中...' : '投稿する'}
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
