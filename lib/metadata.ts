import { Metadata } from 'next'

// サイト基本情報
export const siteConfig = {
  name: 'FitConnect',
  description:
    'フィットネス愛好者のためのソーシャルプラットフォーム。ワークアウトを記録・共有し、AIコーチングでフィットネス目標を達成しよう。',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fitconnect.app',
  ogImage: '/og-image.png',
  creator: 'FitConnect Team',
  keywords: [
    'フィットネス',
    'ワークアウト',
    'トレーニング',
    'ソーシャル',
    'AI',
    'コーチング',
    'フィットネス記録',
    'エクササイズ',
    '筋トレ',
    'ヘルスケア',
  ],
  authors: [
    {
      name: 'FitConnect Team',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fitconnect.app',
    },
  ],
}

// デフォルトメタデータ
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@fitconnect',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-32x32.png',
    shortcut: '/icons/icon-16x16.png',
    apple: '/icons/icon-192x192.png',
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
    yandex: process.env.YANDEX_VERIFICATION_ID,
    yahoo: process.env.YAHOO_VERIFICATION_ID,
  },
}

// ページ別メタデータ生成関数
export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
}): Metadata {
  const pageUrl = `${siteConfig.url}${path}`
  const pageImage = image || siteConfig.ogImage

  return {
    title,
    description,
    openGraph: {
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      url: pageUrl,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
      publishedTime,
      modifiedTime,
      authors,
      tags,
    },
    twitter: {
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      images: [pageImage],
    },
    alternates: {
      canonical: pageUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  }
}

// ユーザープロフィール用メタデータ
export function generateUserMetadata({
  username,
  bio,
  avatarUrl,
  userId,
}: {
  username: string
  bio?: string
  avatarUrl?: string
  userId: string
}): Metadata {
  const title = `${username} - FitConnect`
  const description = bio || `${username}さんのフィットネスプロフィール`
  const path = `/users/${userId}`

  return generatePageMetadata({
    title,
    description,
    path,
    image: avatarUrl,
  })
}

// ワークアウト用メタデータ
export function generateWorkoutMetadata({
  title,
  description,
  exercises,
  duration,
  totalVolume,
  workoutId,
  createdAt,
  username,
}: {
  title: string
  description?: string
  exercises: string[]
  duration?: number
  totalVolume?: number
  workoutId: string
  createdAt: string
  username: string
}): Metadata {
  const workoutTitle = `${title} - ${username}のワークアウト`
  const workoutDescription =
    description ||
    `${exercises.join(', ')}を含む${duration ? `${duration}分の` : ''}ワークアウト${totalVolume ? `。総重量: ${totalVolume}kg` : ''}`

  return generatePageMetadata({
    title: workoutTitle,
    description: workoutDescription,
    path: `/workouts/${workoutId}`,
    publishedTime: createdAt,
    authors: [username],
    tags: exercises,
  })
}

// 投稿用メタデータ
export function generatePostMetadata({
  content,
  hashtags,
  imageUrl,
  postId,
  createdAt,
  username,
}: {
  content: string
  hashtags: string[]
  imageUrl?: string
  postId: string
  createdAt: string
  username: string
}): Metadata {
  const title = `${username}の投稿 - FitConnect`
  const description =
    content.substring(0, 160) + (content.length > 160 ? '...' : '')

  return generatePageMetadata({
    title,
    description,
    path: `/posts/${postId}`,
    image: imageUrl,
    publishedTime: createdAt,
    authors: [username],
    tags: hashtags,
  })
}

// 構造化データ生成
export function generateStructuredData(
  type: 'website' | 'article' | 'profile' | 'organization',
  data: any,
) {
  const baseData = {
    '@context': 'https://schema.org',
  }

  switch (type) {
    case 'website':
      return {
        ...baseData,
        '@type': 'WebSite',
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.url,
          logo: `${siteConfig.url}/icons/icon-192x192.png`,
        },
      }

    case 'organization':
      return {
        ...baseData,
        '@type': 'Organization',
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        logo: `${siteConfig.url}/icons/icon-192x192.png`,
        sameAs: [
          // ソーシャルメディアリンクがあれば追加
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'support@fitconnect.app',
        },
      }

    case 'article':
      return {
        ...baseData,
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image || siteConfig.ogImage,
        author: {
          '@type': 'Person',
          name: data.author,
        },
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          logo: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}/icons/icon-192x192.png`,
          },
        },
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime || data.publishedTime,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url,
        },
      }

    case 'profile':
      return {
        ...baseData,
        '@type': 'Person',
        name: data.name,
        description: data.bio,
        image: data.avatarUrl,
        url: data.profileUrl,
        sameAs: data.socialLinks || [],
      }

    default:
      return baseData
  }
}
