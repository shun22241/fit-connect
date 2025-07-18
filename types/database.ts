import { Prisma } from '@prisma/client'

// User型とその関連型
export type User = Prisma.UserGetPayload<{}>
export type UserWithStats = Prisma.UserGetPayload<{
  include: {
    workouts: true
    posts: true
    following: true
    followers: true
  }
}>

// Workout型とその関連型
export type Workout = Prisma.WorkoutGetPayload<{}>
export type WorkoutWithExercises = Prisma.WorkoutGetPayload<{
  include: {
    exercises: true
    user: true
  }
}>

// Exercise型
export type Exercise = Prisma.ExerciseGetPayload<{}>

// Post型とその関連型
export type Post = Prisma.PostGetPayload<{}>
export type PostWithDetails = Prisma.PostGetPayload<{
  include: {
    user: true
    workout: {
      include: {
        exercises: true
      }
    }
    likes: true
    comments: {
      include: {
        user: true
      }
    }
    _count: {
      select: {
        likes: true
        comments: true
      }
    }
  }
}>

// Frontend用のPost型（PostCardコンポーネントで期待される形式）
export type PostWithIsLiked = {
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

// Like型
export type Like = Prisma.LikeGetPayload<{}>

// Comment型とその関連型
export type Comment = Prisma.CommentGetPayload<{}>
export type CommentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: true
  }
}>

// Follow型
export type Follow = Prisma.FollowGetPayload<{}>

// API Response types
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export type CreateWorkoutData = {
  name: string
  notes?: string
  duration?: number
  exercises: {
    exerciseName: string
    sets: number
    reps: number[]
    weights: number[]
    restSeconds: number[]
  }[]
}

export type CreatePostData = {
  content: string
  imageUrl?: string
  workoutId?: string
  hashtags: string[]
}

export type UpdateUserData = {
  username?: string
  bio?: string
  avatarUrl?: string
}
