// Jest セットアップファイル
import '@testing-library/jest-dom'

// IntersectionObserver のモック
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// ResizeObserver のモック
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// localStorage のモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// sessionStorage のモック
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// fetch のモック
global.fetch = jest.fn()

// Push Notification のモック
global.Notification = {
  permission: 'default',
  requestPermission: jest.fn(() => Promise.resolve('granted')),
}

// Service Worker のモック
global.navigator.serviceWorker = {
  register: jest.fn(() => Promise.resolve()),
  ready: Promise.resolve({
    pushManager: {
      subscribe: jest.fn(() => Promise.resolve({})),
      getSubscription: jest.fn(() => Promise.resolve(null)),
    },
  }),
}

// Web Push のモック
global.PushManager = {
  supportedContentEncodings: ['aes128gcm'],
}

// 共有テストユーティリティ
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  avatarUrl: null,
  bio: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockWorkout = {
  id: 'test-workout-id',
  title: 'Test Workout',
  exercises: [
    {
      id: 'test-exercise-id',
      name: 'Test Exercise',
      sets: 3,
      reps: 10,
      weight: 50,
    },
  ],
  duration: 60,
  totalVolume: 1500,
  isPublic: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'test-user-id',
}

export const mockPost = {
  id: 'test-post-id',
  content: 'Test post content',
  imageUrl: null,
  hashtags: ['#fitness', '#workout'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'test-user-id',
  workoutId: 'test-workout-id',
}

// 各テスト前の共通セットアップ
beforeEach(() => {
  // fetch モックのリセット
  fetch.mockClear()

  // localStorage モックのリセット
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()

  // sessionStorage モックのリセット
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
})

// 各テスト後のクリーンアップ
afterEach(() => {
  jest.clearAllMocks()
})
