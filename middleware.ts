import { type NextRequest, NextResponse } from 'next/server'
import { securityHeaders, logSecurityEvent } from '@/lib/security'
import { ratelimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'
import { performanceMonitor } from '@/lib/monitoring'

// サーバー側でのIP取得関数
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()

  return 'unknown'
}
// import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 開発環境とVercelプレビュー環境では重い処理をスキップ
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') {
    const response = NextResponse.next()
    
    // 必要最小限のセキュリティヘッダーのみ追加
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    // 保護されたパスのチェック（簡略化）
    const pathname = request.nextUrl.pathname
    if (pathname.startsWith('/dashboard') || 
        pathname.startsWith('/profile') || 
        pathname.startsWith('/workouts/new') || 
        pathname.startsWith('/posts/new')) {
      // 開発環境では認証チェックをスキップ
      console.log('🎯 Dev mode: Auth check skipped for', pathname)
    }
    
    return response
  }
  
  // 以下は本番環境のみで実行
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substr(2, 9)

  // リクエストログ
  logger.info('Middleware: Request started', {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: getClientIP(request),
  })

  // パフォーマンス測定開始
  performanceMonitor.startTimer(`middleware_${requestId}`)
  performanceMonitor.incrementCounter('middleware_requests')

  const response = NextResponse.next()

  // セキュリティヘッダーを追加
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // APIルートのレート制限
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIP(request)
    const rateLimitResult = await ratelimit.limit(ip, {
      requests: 100,
      window: '1h',
    })

    if (!rateLimitResult.success) {
      logSecurityEvent({
        type: 'rate_limit',
        ip,
        userAgent: request.headers.get('user-agent') || '',
        details: {
          endpoint: request.nextUrl.pathname,
          method: request.method,
        },
      })

      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message:
            'レート制限に達しました。しばらく待ってから再試行してください。',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        },
      )
    }

    // レート制限情報をヘッダーに追加
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimitResult.remaining.toString(),
    )
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
  }

  // 認証が必要なルートの保護
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/workouts/new',
    '/posts/new',
  ]
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isProtectedPath) {
    // デモモード: 認証チェックを無効化
    console.log('🔒 Protected path accessed:', request.nextUrl.pathname)
    
    // 開発環境では認証チェックをスキップ
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Development mode: Skipping auth check')
      // 認証チェックをスキップ
    } else {
      // 本番環境での認証チェック
      const authCookie = request.cookies.get('auth-token')
      if (!authCookie) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // リクエストヘッダーにメタデータを追加
  response.headers.set('X-Request-ID', requestId)

  // パフォーマンス測定終了
  const duration = performanceMonitor.endTimer(`middleware_${requestId}`)

  logger.info('Middleware: Request completed', {
    requestId,
    duration: `${duration}ms`,
    status: response.status,
  })

  // Temporarily disable Supabase middleware for demo
  return response
  // return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
