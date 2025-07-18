import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fitconnect.app'
  const currentDate = new Date()

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workouts`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workouts/new`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/workouts/ai-assist`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/posts/new`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    const supabase = await createClient()

    // 動的ページ: ユーザープロフィール
    const { data: users } = await supabase
      .from('User')
      .select('id, updatedAt')
      .limit(1000) // パフォーマンスを考慮して制限

    const userPages: MetadataRoute.Sitemap =
      users?.map((user: any) => ({
        url: `${baseUrl}/users/${user.id}`,
        lastModified: new Date(user.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || []

    // 動的ページ: ワークアウト詳細
    const { data: workouts } = await supabase
      .from('Workout')
      .select('id, updatedAt, isPublic')
      .eq('isPublic', true)
      .limit(1000)

    const workoutPages: MetadataRoute.Sitemap =
      workouts?.map((workout: any) => ({
        url: `${baseUrl}/workouts/${workout.id}`,
        lastModified: new Date(workout.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })) || []

    // 動的ページ: 投稿詳細（公開投稿のみ）
    const { data: posts } = await supabase
      .from('Post')
      .select('id, updatedAt')
      .limit(1000)

    const postPages: MetadataRoute.Sitemap =
      posts?.map((post: any) => ({
        url: `${baseUrl}/posts/${post.id}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.4,
      })) || []

    return [...staticPages, ...userPages, ...workoutPages, ...postPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // エラー時は静的ページのみ返す
    return staticPages
  }
}

// サイトマップの追加設定
export const revalidate = 3600 // 1時間ごとに再生成
