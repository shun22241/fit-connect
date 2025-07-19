import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔄 Auth callback:', { 
    code: !!code, 
    next, 
    origin,
    requestUrl: request.url 
  })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('✅ Session exchange successful, redirecting to:', next)
      
      // Vercel環境での特別な処理
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isProduction = process.env.NODE_ENV === 'production'
      
      // 本番環境ではVercelのURLを使用
      if (isProduction && forwardedHost) {
        const redirectUrl = `https://${forwardedHost}${next}`
        console.log('🚀 Production redirect to:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      }
      
      // 開発環境
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('❌ Session exchange failed:', error)
    }
  }

  console.log('❌ Auth callback failed, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}