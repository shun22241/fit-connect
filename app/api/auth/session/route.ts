import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error:', error)
      return NextResponse.json({ 
        error: error.message,
        hasSession: false 
      }, { status: 401 })
    }
    
    if (!session) {
      return NextResponse.json({ 
        message: 'No active session',
        hasSession: false 
      }, { status: 401 })
    }
    
    // Refresh session to ensure it's valid
    const { data: { user }, error: refreshError } = await supabase.auth.getUser()
    
    if (refreshError || !user) {
      return NextResponse.json({ 
        error: 'Session invalid',
        hasSession: false 
      }, { status: 401 })
    }
    
    return NextResponse.json({
      hasSession: true,
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at
      },
      session: {
        accessToken: session.access_token ? 'present' : 'missing',
        refreshToken: session.refresh_token ? 'present' : 'missing',
        expiresAt: session.expires_at,
        expiresIn: session.expires_in
      }
    })
  } catch (error: any) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      error: error.message,
      hasSession: false 
    }, { status: 500 })
  }
}