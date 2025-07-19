import { NextResponse } from 'next/server'

export async function GET() {
  // 本番環境でも安全に環境変数を確認
  const envCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: {
      env: process.env.VERCEL_ENV,
      url: process.env.VERCEL_URL,
      region: process.env.VERCEL_REGION,
    },
    supabase: {
      url: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        startsWithHttps: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://'),
        endsWithSupabaseCo: process.env.NEXT_PUBLIC_SUPABASE_URL?.endsWith('.supabase.co'),
        length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
      },
      anonKey: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        startsWithEyJ: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ'),
        length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      },
      serviceKey: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
      }
    },
    nextAuth: {
      url: process.env.NEXTAUTH_URL,
      secretExists: !!process.env.NEXTAUTH_SECRET,
    },
    publicUrl: process.env.NEXT_PUBLIC_SITE_URL,
  }

  return NextResponse.json(envCheck)
}