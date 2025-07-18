// インテグレーションテスト用のグローバルセットアップ
const { execSync } = require('child_process')

module.exports = async () => {
  console.log('🗄️ Setting up test database...')

  try {
    // テストデータベースのマイグレーション実行
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL:
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5432/fitconnect_test',
      },
      stdio: 'inherit',
    })

    console.log('✅ Test database setup completed')
  } catch (error) {
    console.error('❌ Test database setup failed:', error.message)
    process.exit(1)
  }
}
