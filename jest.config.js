const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js アプリのルートディレクトリパス
  dir: './',
})

// カスタム Jest 設定
const customJestConfig = {
  // テスト環境の設定
  testEnvironment: 'jsdom',

  // セットアップファイルの指定
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // テストファイルのパターン
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // テスト対象外のディレクトリ
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/docker/',
    '<rootDir>/dist/',
  ],

  // カバレッジ設定
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!jest.setup.js',
    '!next.config.mjs',
    '!tailwind.config.js',
    '!postcss.config.mjs',
    '!prisma/**',
    '!docker/**',
    '!.github/**',
  ],

  // カバレッジしきい値
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // カバレッジレポートの形式
  coverageReporters: ['text', 'lcov', 'html'],

  // モジュールのエイリアス設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
  },

  // 変換ルールの設定
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // 環境変数の設定
  setupFiles: ['<rootDir>/jest.env.js'],

  // テストタイムアウト
  testTimeout: 10000,

  // 並列実行の設定
  maxWorkers: '50%',

  // Verbose モード
  verbose: true,
}

// Next.js 用の Jest 設定を作成して export
module.exports = createJestConfig(customJestConfig)
