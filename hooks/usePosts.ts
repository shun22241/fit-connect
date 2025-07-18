'use client'

import { useState, useEffect } from 'react'
import {
  PostWithDetails,
  PostWithIsLiked,
  CreatePostData,
  CommentWithUser,
  ApiResponse,
} from '@/types/database'

export function usePosts(userId?: string) {
  const [posts, setPosts] = useState<PostWithIsLiked[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/posts?${params}`)
      const result: ApiResponse<PostWithIsLiked[]> = await response.json()

      if (result.success && result.data) {
        setPosts(result.data)
      } else {
        setError(result.error || 'Failed to fetch posts')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (data: CreatePostData) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<PostWithIsLiked> = await response.json()

      if (result.success && result.data) {
        setPosts((prev) => [result.data!, ...prev])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  const toggleLike = async (postId: string, isLiked: boolean) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      })

      const result = await response.json()

      if (result.success) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              const newLikesCount = isLiked
                ? post._count.likes - 1
                : post._count.likes + 1

              return {
                ...post,
                _count: {
                  ...post._count,
                  likes: newLikesCount,
                },
                isLiked: !isLiked, // Toggle the liked state
              }
            }
            return post
          }),
        )
      } else {
        throw new Error(result.error || 'Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  const addComment = async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      const result: ApiResponse<CommentWithUser> = await response.json()

      if (result.success && result.data) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                _count: {
                  ...post._count,
                  comments: post._count.comments + 1,
                },
              }
            }
            return post
          }),
        )
        return result.data
      } else {
        throw new Error(result.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [userId])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    toggleLike,
    addComment,
  }
}

// ヘルパー関数（実際の実装では認証コンテキストから取得）
function getCurrentUserId(): string {
  // 仮の実装 - 実際にはSupabaseの認証状態から取得
  return 'current-user-id'
}
