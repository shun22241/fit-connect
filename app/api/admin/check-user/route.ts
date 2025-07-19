import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // Check auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(u => u.email === email)
    
    // Check if user exists in any custom user tables (if you have them)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle()
    
    // Get user by ID if auth user exists
    let userById = null
    if (authUser) {
      const { data: userByIdData, error: userByIdError } = await supabase.auth.admin.getUserById(authUser.id)
      userById = { data: userByIdData, error: userByIdError }
    }
    
    return NextResponse.json({
      email,
      authUser: authUser || null,
      authError,
      profileData: profileData || null,
      profileError,
      userById,
      totalAuthUsers: authUsers?.users?.length || 0,
      status: {
        hasAuthUser: !!authUser,
        hasProfile: !!profileData,
        emailConfirmed: authUser?.email_confirmed_at ? true : false,
        userCreatedAt: authUser?.created_at,
        lastSignIn: authUser?.last_sign_in_at
      }
    })
    
  } catch (error: any) {
    console.error('Error checking user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}