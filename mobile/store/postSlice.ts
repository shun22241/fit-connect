import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  username: string
  avatarUrl?: string
}

interface Post {
  id: string
  content: string
  imageUrl?: string
  hashtags: string[]
  createdAt: string
  user: User
  workout?: {
    id: string
    title: string
    totalVolume: number
    duration: number
  }
  _count: {
    likes: number
    comments: number
  }
  isLiked: boolean
}

interface PostState {
  posts: Post[]
  userPosts: Post[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
}

const initialState: PostState = {
  posts: [],
  userPosts: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 0,
}

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload
      state.loading = false
    },
    addPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = [...state.posts, ...action.payload]
      state.loading = false
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload)
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.posts[index] = action.payload
      }

      const userIndex = state.userPosts.findIndex(
        (p) => p.id === action.payload.id,
      )
      if (userIndex !== -1) {
        state.userPosts[userIndex] = action.payload
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload)
      state.userPosts = state.userPosts.filter((p) => p.id !== action.payload)
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p.id === action.payload)
      if (post) {
        post.isLiked = !post.isLiked
        post._count.likes += post.isLiked ? 1 : -1
      }

      const userPost = state.userPosts.find((p) => p.id === action.payload)
      if (userPost) {
        userPost.isLiked = !userPost.isLiked
        userPost._count.likes += userPost.isLiked ? 1 : -1
      }
    },
    setUserPosts: (state, action: PayloadAction<Post[]>) => {
      state.userPosts = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload
    },
    incrementPage: (state) => {
      state.page += 1
    },
    resetPagination: (state) => {
      state.page = 0
      state.hasMore = true
      state.posts = []
    },
  },
})

export const {
  setPosts,
  addPosts,
  addPost,
  updatePost,
  deletePost,
  toggleLike,
  setUserPosts,
  setLoading,
  setError,
  clearError,
  setHasMore,
  incrementPage,
  resetPagination,
} = postSlice.actions

export default postSlice.reducer
