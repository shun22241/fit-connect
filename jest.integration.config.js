const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

// インテグレーションテスト用の Jest 設定
const integrationJestConfig = {
  displayName: 'Integration Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // インテグレーションテストのみを実行
  testMatch: [
    '<rootDir>/**/__tests__/integration/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.integration.{test,spec}.{js,jsx,ts,tsx}',
  ],

  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/docker/',
    '<rootDir>/dist/',
  ],

  // インテグレーションテスト用の設定
  testTimeout: 30000, // より長いタイムアウト

  // データベース接続が必要なテスト用の設定
  globalSetup: '<rootDir>/jest.integration.setup.js',
  globalTeardown: '<rootDir>/jest.integration.teardown.js',

  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
  },

  setupFiles: ['<rootDir>/jest.env.js'],

  // シリアル実行（データベースの競合を避けるため）
  maxWorkers: 1,

  verbose: true,

  // カバレッジ設定を無効化（パフォーマンス向上のため）
  collectCoverage: false,
}

module.exports = createJestConfig(integrationJestConfig)
