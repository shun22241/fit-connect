import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // セッション情報を取得
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        exists: !!sessionData.session,
        accessToken: sessionData.session?.access_token ? '存在' : '不存在',
        expiresAt: sessionData.session?.expires_at,
        error: sessionError?.message
      },
      user: {
        exists: !!userData.user,
        id: userData.user?.id,
        email: userData.user?.email,
        emailConfirmed: userData.user?.email_confirmed_at ? 'はい' : 'いいえ',
        error: userError?.message
      },
      canAccessDashboard: !!(sessionData.session && userData.user)
    })
  } catch (error: any) {
    return NextResponse.json({
      error: '認証チェックに失敗しました',
      details: error.message
    }, { status: 500 })
  }
}