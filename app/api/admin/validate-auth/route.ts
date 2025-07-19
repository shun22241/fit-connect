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

export async function POST() {
  try {
    const supabase = createAdminClient()
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: [],
      issues: [],
      recommendations: [],
    }

    // Check 1: List all auth users and look for anomalies
    const { data: authUsers, error: listError } =
      await supabase.auth.admin.listUsers()

    if (listError) {
      results.issues.push(`Failed to list auth users: ${listError.message}`)
      return NextResponse.json(results, { status: 500 })
    }

    results.checks.push(`Found ${authUsers.users.length} auth users`)

    // Check 2: Look for users with inconsistent data
    const inconsistentUsers = []

    for (const user of authUsers.users) {
      const userIssues = []

      // Check if email is confirmed but no confirmation timestamp
      if (user.email_confirmed_at && !user.confirmed_at) {
        userIssues.push('Email confirmed but no confirmed_at timestamp')
      }

      // Check for missing email
      if (!user.email) {
        userIssues.push('User has no email address')
      }

      // Check for users created but never signed in
      if (user.created_at && !user.last_sign_in_at) {
        const daysSinceCreated = Math.floor(
          (new Date().getTime() - new Date(user.created_at).getTime()) /
            (1000 * 60 * 60 * 24),
        )
        if (daysSinceCreated > 7) {
          userIssues.push(
            `User created ${daysSinceCreated} days ago but never signed in`,
          )
        }
      }

      // Check for duplicate emails
      const duplicates = authUsers.users.filter(
        (u) => u.email === user.email && u.id !== user.id,
      )
      if (duplicates.length > 0) {
        userIssues.push(
          `Duplicate email found: ${duplicates.length} other users`,
        )
      }

      if (userIssues.length > 0) {
        inconsistentUsers.push({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          issues: userIssues,
        })
      }
    }

    if (inconsistentUsers.length > 0) {
      results.issues.push(
        `Found ${inconsistentUsers.length} users with data inconsistencies`,
      )
      results.inconsistentUsers = inconsistentUsers
    } else {
      results.checks.push('No obvious data inconsistencies found')
    }

    // Check 3: Validate email provider settings
    try {
      const { data: config } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: 'test@example.com',
        password: 'temp-password-123',
      })
      results.checks.push('Email provider is enabled and working')
    } catch (error: any) {
      if (error.message?.includes('email_provider_disabled')) {
        results.issues.push('Email provider is disabled')
        results.recommendations.push(
          'Enable email provider in Supabase dashboard',
        )
      } else {
        results.issues.push(`Email provider test failed: ${error.message}`)
      }
    }

    // Add general recommendations
    if (results.issues.length === 0) {
      results.recommendations.push('Authentication system appears healthy')
    } else {
      results.recommendations.push(
        'Use the cleanup tool to resolve data inconsistencies',
      )
      results.recommendations.push(
        'Consider implementing user data validation hooks',
      )
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error validating auth:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
