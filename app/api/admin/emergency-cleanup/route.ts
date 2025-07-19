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
    const { email, action } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const results: any = {
      email,
      timestamp: new Date().toISOString(),
      action,
      steps: [],
      errors: [],
      corruption_detected: false,
      cleanup_completed: false
    }
    
    // STEP 1: Comprehensive corruption detection
    results.steps.push('🔍 Starting comprehensive corruption scan...')
    
    // Get all users to check for duplicates and inconsistencies
    const { data: allUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      results.errors.push(`Failed to list users: ${listError.message}`)
      return NextResponse.json(results, { status: 500 })
    }
    
    // Find all users with this email (should only be 1)
    const usersWithEmail = allUsers.users.filter(u => u.email === email)
    results.steps.push(`Found ${usersWithEmail.length} auth users with email: ${email}`)
    
    if (usersWithEmail.length > 1) {
      results.corruption_detected = true
      results.steps.push(`⚠️ CORRUPTION: Multiple users found with same email!`)
    }
    
    // Check each user for corruption signs
    for (const user of usersWithEmail) {
      results.steps.push(`\n📊 Analyzing user: ${user.id}`)
      results.steps.push(`  - Created: ${user.created_at}`)
      results.steps.push(`  - Email confirmed: ${user.email_confirmed_at || 'No'}`)
      results.steps.push(`  - Last sign in: ${user.last_sign_in_at || 'Never'}`)
      results.steps.push(`  - Confirmed at: ${user.confirmed_at || 'No'}`)
      
      // Corruption indicators
      const corruptions = []
      
      if (!user.email_confirmed_at && user.confirmed_at) {
        corruptions.push('Email confirmed timestamp missing but confirmed_at exists')
      }
      
      if (user.email_confirmed_at && !user.confirmed_at) {
        corruptions.push('Email confirmed but no confirmed_at timestamp')
      }
      
      if (!user.email) {
        corruptions.push('User has no email address')
      }
      
      // Check if user was created recently but has old timestamps
      const createdDate = new Date(user.created_at)
      const now = new Date()
      const ageInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (ageInDays > 30 && !user.last_sign_in_at) {
        corruptions.push(`User created ${Math.floor(ageInDays)} days ago but never signed in`)
      }
      
      if (corruptions.length > 0) {
        results.corruption_detected = true
        results.steps.push(`  ⚠️ CORRUPTIONS DETECTED:`)
        corruptions.forEach(c => results.steps.push(`    - ${c}`))
      } else {
        results.steps.push(`  ✅ No obvious corruption detected`)
      }
    }
    
    // STEP 2: If action is 'cleanup', perform emergency cleanup
    if (action === 'cleanup' && usersWithEmail.length > 0) {
      results.steps.push(`\n🧹 Starting emergency cleanup...`)
      
      for (const user of usersWithEmail) {
        results.steps.push(`\n🗑️ Deleting user: ${user.id}`)
        
        // Delete from auth.users
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          results.errors.push(`Failed to delete user ${user.id}: ${deleteError.message}`)
        } else {
          results.steps.push(`  ✅ Deleted from auth.users`)
        }
        
        // Clean up any sessions
        try {
          await supabase.auth.admin.signOut(user.id, 'global')
          results.steps.push(`  ✅ Signed out all sessions`)
        } catch (e) {
          results.steps.push(`  ⚠️ Session cleanup not needed or failed`)
        }
      }
      
      // Clean up profile data if exists
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('email', email)
        
        if (profileError && !profileError.message.includes('does not exist')) {
          results.errors.push(`Profile cleanup error: ${profileError.message}`)
        } else {
          results.steps.push(`  ✅ Profile data cleaned`)
        }
      } catch (e) {
        results.steps.push(`  ℹ️ No profile table or no data to clean`)
      }
      
      // Clear any cached authentication data
      results.steps.push(`\n🔄 Cache clearing recommendations:`)
      results.steps.push(`  - Browser: localStorage.clear() + sessionStorage.clear()`)
      results.steps.push(`  - Supabase: Client-side auth state reset`)
      
      results.cleanup_completed = results.errors.length === 0
      
      if (results.cleanup_completed) {
        results.steps.push(`\n✅ EMERGENCY CLEANUP COMPLETED`)
        results.steps.push(`User can now register with email: ${email}`)
      } else {
        results.steps.push(`\n❌ CLEANUP FAILED - Check errors`)
      }
    }
    
    // STEP 3: Generate new email suggestion if needed
    if (action === 'suggest_email') {
      const emailParts = email.split('@')
      const username = emailParts[0]
      const domain = emailParts[1]
      const timestamp = Date.now().toString().slice(-4)
      
      results.suggested_emails = [
        `${username}+new@${domain}`,
        `${username}.${timestamp}@${domain}`,
        `${username}_clean@${domain}`
      ]
      
      results.steps.push(`\n💡 Suggested clean email addresses:`)
      results.suggested_emails.forEach(e => results.steps.push(`  - ${e}`))
    }
    
    return NextResponse.json(results)
    
  } catch (error: any) {
    console.error('Emergency cleanup error:', error)
    return NextResponse.json({ 
      error: 'Emergency cleanup failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}