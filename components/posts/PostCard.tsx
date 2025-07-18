'use client'

import { useState, useCallback, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import SwipeableCard from '@/components/ui/SwipeableCard'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { formatDistance } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Heart,
  MessageCircle,
  Share2,
  Dumbbell,
  Clock,
  Target,
  Send,
} from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'

interface PostCardProps {
  post: {
    id: string
    content: string
    imageUrl: string | null
    hashtags: string[]
    createdAt: string
    user: {
      id: string
      username: string | null
      avatarUrl: string | null
      email?: string
    }
    workout: {
      id: string
      title: string
      totalVolume: number
      duration: number
    } | null
    _count: {
      likes: number
      comments: number
    }
    isLiked: boolean
  }
}

export const PostCard = memo(
  function PostCard({ post }: PostCardProps) {
    const { toggleLike, addComment } = usePosts()
    const [showCommentForm, setShowCommentForm] = useState(false)
    const [commentContent, setCommentContent] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)

    const isLiked = post.isLiked

    const handleLike = useCallback(async () => {
      try {
        await toggleLike(post.id, isLiked)
      } catch (error) {
        console.error('Failed to toggle like:', error)
      }
    }, [toggleLike, post.id, isLiked])

    const handleComment = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentContent.trim()) return

        setSubmittingComment(true)
        try {
          await addComment(post.id, commentContent.trim())
          setCommentContent('')
          setShowCommentForm(false)
        } catch (error) {
          console.error('Failed to add comment:', error)
        } finally {
          setSubmittingComment(false)
        }
      },
      [addComment, post.id, commentContent],
    )

    const toggleCommentForm = useCallback(() => {
      setShowCommentForm((prev) => !prev)
    }, [])

    const handleCommentChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCommentContent(e.target.value)
      },
      [],
    )

    return (
      <SwipeableCard
        onSwipeRight={handleLike}
        onSwipeLeft={toggleCommentForm}
        rightAction={{
          icon: <Heart className="h-5 w-5" />,
          color: 'green',
          label: 'いいね',
        }}
        leftAction={{
          icon: <MessageCircle className="h-5 w-5" />,
          color: 'blue',
          label: 'コメント',
        }}
        className="w-full"
      >
        <CardContent className="p-6">
          {/* ユーザー情報 */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              {post.user.avatarUrl ? (
                <Image
                  src={post.user.avatarUrl}
                  alt={post.user.username || 'User'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                  {(post.user.username ||
                    post.user.email ||
                    'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/users/${post.user.id}`}
                  className="font-semibold text-gray-900 hover:underline"
                >
                  {post.user.username || 'User'}
                </Link>
                <span className="text-gray-500 text-sm">
                  {formatDistance(new Date(post.createdAt), new Date(), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* 投稿内容 */}
          <div className="mb-4">
            <p className="text-gray-900 whitespace-pre-wrap mb-3">
              {post.content}
            </p>

            {/* ハッシュタグ */}
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.hashtags.map((hashtag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-blue-600"
                  >
                    #{hashtag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 画像 */}
          {post.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* ワークアウト情報 */}
          {post.workout && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {post.workout.title}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  総重量: {post.workout.totalVolume}kg
                </div>
                {post.workout.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.workout.duration}分
                  </div>
                )}
              </div>
              <Link
                href={`/workouts/${post.workout.id}`}
                className="text-blue-600 text-sm hover:underline mt-2 inline-block"
              >
                ワークアウト詳細を見る →
              </Link>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-2 ${
                  isLiked ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post._count.likes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCommentForm}
                className="flex items-center gap-2 text-gray-600"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post._count.comments}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-600"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* コメント入力フォーム */}
          {showCommentForm && (
            <form onSubmit={handleComment} className="mt-4 flex gap-2">
              <Textarea
                value={commentContent}
                onChange={handleCommentChange}
                placeholder="コメントを入力..."
                className="flex-1 min-h-[80px]"
                disabled={submittingComment}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!commentContent.trim() || submittingComment}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>
      </SwipeableCard>
    )
  },
  (prevProps, nextProps) => {
    // 最適化: postの重要な値のみを比較して再レンダリングを制御
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.isLiked === nextProps.post.isLiked &&
      prevProps.post._count.likes === nextProps.post._count.likes &&
      prevProps.post._count.comments === nextProps.post._count.comments &&
      prevProps.post.content === nextProps.post.content
    )
  },
)

export default PostCard
