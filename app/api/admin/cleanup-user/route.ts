import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(request: Request) {
  let email: string = ''

  try {
    const body = await request.json()
    email = body.email

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const results: any = {
      email,
      steps: [],
      errors: [],
    }

    // Step 1: Find user in auth.users
    const { data: authUsers, error: listError } =
      await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find((u) => u.email === email)

    if (listError) {
      results.errors.push(`Failed to list users: ${listError.message}`)
      return NextResponse.json(results, { status: 500 })
    }

    results.steps.push(
      `Found ${authUsers?.users?.length || 0} total auth users`,
    )

    if (authUser) {
      results.steps.push(`Found auth user: ${authUser.id}`)

      // Step 2: Delete from auth.users
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
        authUser.id,
      )

      if (deleteAuthError) {
        results.errors.push(
          `Failed to delete auth user: ${deleteAuthError.message}`,
        )
      } else {
        results.steps.push(`✅ Deleted auth user: ${authUser.id}`)
      }
    } else {
      results.steps.push(`No auth user found with email: ${email}`)
    }

    // Step 3: Clean up any profile data (if you have a profiles table)
    try {
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('email', email)

      if (profileDeleteError) {
        results.errors.push(
          `Profile cleanup error: ${profileDeleteError.message}`,
        )
      } else {
        results.steps.push(`✅ Cleaned up profile data for: ${email}`)
      }
    } catch (e) {
      results.steps.push(`No profiles table found or accessible`)
    }

    // Step 4: Clean up any other related data
    // Add more cleanup steps here based on your schema

    results.steps.push(`🧹 Cleanup completed for: ${email}`)
    results.success = results.errors.length === 0

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error cleaning up user:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        email,
      },
      { status: 500 },
    )
  }
}
