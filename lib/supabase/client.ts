import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔧 Creating Supabase client...')
  console.log('📍 Supabase URL:', supabaseUrl)
  console.log(
    '🔑 Supabase Key:',
    supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET',
  )
  console.log('🌍 Environment:', process.env.NODE_ENV)

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    console.error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
      supabaseKey ? 'SET' : 'NOT SET',
    )
    throw new Error(
      'Supabase environment variables are not properly configured',
    )
  }

  try {
    const client = createBrowserClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase client created successfully')
    return client
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    throw error
  }
}
