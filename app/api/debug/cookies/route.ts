import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll()
  
  const cookieInfo = {
    timestamp: new Date().toISOString(),
    totalCookies: cookies.length,
    supabaseCookies: cookies.filter(c => c.name.includes('supabase')),
    allCookies: cookies.map(c => ({
      name: c.name,
      valueLength: c.value?.length || 0,
      hasValue: !!c.value
    })),
    headers: {
      host: request.headers.get('host'),
      xForwardedHost: request.headers.get('x-forwarded-host'),
      xForwardedProto: request.headers.get('x-forwarded-proto'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    }
  }
  
  return NextResponse.json(cookieInfo)
}