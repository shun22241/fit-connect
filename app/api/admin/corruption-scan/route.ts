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

export async function GET() {
  try {
    const supabase = createAdminClient()
    const results: any = {
      timestamp: new Date().toISOString(),
      total_users: 0,
      corrupted_users: [],
      duplicate_emails: [],
      orphaned_sessions: [],
      recommendations: []
    }
    
    // Get all auth users
    const { data: allUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }
    
    results.total_users = allUsers.users.length
    
    // Check for corrupted users
    const emailGroups: { [email: string]: any[] } = {}
    
    for (const user of allUsers.users) {
      // Group by email to find duplicates
      if (user.email) {
        if (!emailGroups[user.email]) {
          emailGroups[user.email] = []
        }
        emailGroups[user.email].push(user)
      }
      
      // Check for individual corruption signs
      const corruptions = []
      
      if (!user.email) {
        corruptions.push('Missing email address')
      }
      
      if (user.email_confirmed_at && !user.confirmed_at) {
        corruptions.push('Email confirmed timestamp mismatch')
      }
      
      if (!user.email_confirmed_at && user.confirmed_at) {
        corruptions.push('Confirmed timestamp without email confirmation')
      }
      
      // Check for old unconfirmed users
      const createdDate = new Date(user.created_at)
      const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (!user.email_confirmed_at && daysSinceCreated > 7) {
        corruptions.push(`Unconfirmed for ${daysSinceCreated} days`)
      }
      
      if (!user.last_sign_in_at && daysSinceCreated > 1) {
        corruptions.push(`Never signed in (${daysSinceCreated} days old)`)
      }
      
      // Check for malformed data
      if (user.email && !user.email.includes('@')) {
        corruptions.push('Malformed email address')
      }
      
      if (corruptions.length > 0) {
        results.corrupted_users.push({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          confirmed_at: user.confirmed_at,
          corruptions
        })
      }
    }
    
    // Find duplicate emails
    for (const [email, users] of Object.entries(emailGroups)) {
      if (users.length > 1) {
        results.duplicate_emails.push({
          email,
          count: users.length,
          users: users.map(u => ({
            id: u.id,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at
          }))
        })
      }
    }
    
    // Generate recommendations
    if (results.corrupted_users.length > 0) {
      results.recommendations.push(`Found ${results.corrupted_users.length} corrupted users`)
      results.recommendations.push('Use emergency cleanup tool to fix corrupted users')
    }
    
    if (results.duplicate_emails.length > 0) {
      results.recommendations.push(`Found ${results.duplicate_emails.length} duplicate email addresses`)
      results.recommendations.push('Remove duplicate users keeping the most recent one')
    }
    
    if (results.corrupted_users.length === 0 && results.duplicate_emails.length === 0) {
      results.recommendations.push('No obvious corruption detected')
      results.recommendations.push('System appears healthy')
    }
    
    // Add auto-cleanup recommendations
    results.recommendations.push('Consider implementing automated cleanup for old unconfirmed users')
    results.recommendations.push('Set up monitoring for duplicate email detection')
    
    return NextResponse.json(results)
    
  } catch (error: any) {
    console.error('Corruption scan error:', error)
    return NextResponse.json({ 
      error: 'Corruption scan failed',
      details: error.message 
    }, { status: 500 })
  }
}