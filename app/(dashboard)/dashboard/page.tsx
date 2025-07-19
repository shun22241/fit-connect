import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
      <p className="mt-4 text-gray-600">ようこそ、{user?.email}さん！</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            今日のワークアウト
          </h2>
          <p className="mt-2 text-gray-600">まだ記録がありません</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900">週間統計</h2>
          <p className="mt-2 text-gray-600">0回のワークアウト</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900">フォロワー</h2>
          <p className="mt-2 text-gray-600">0人</p>
        </div>
      </div>
    </div>
  )
}
