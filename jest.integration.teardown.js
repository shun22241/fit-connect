// インテグレーションテスト用のグローバル後処理
const { execSync } = require('child_process')

module.exports = async () => {
  console.log('🧹 Cleaning up test database...')

  try {
    // テストデータベースのリセット
    execSync('npx prisma migrate reset --force --skip-seed', {
      env: {
        ...process.env,
        DATABASE_URL:
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5432/fitconnect_test',
      },
      stdio: 'inherit',
    })

    console.log('✅ Test database cleanup completed')
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error.message)
    // テスト終了時のエラーは失敗扱いにしない
  }
}
