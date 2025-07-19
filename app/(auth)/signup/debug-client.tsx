'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugClient() {
  useEffect(() => {
    console.log('🔍 Debug: Client-side environment check')
    console.log('📍 Window location:', window.location.origin)
    console.log('🌍 Browser environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    })

    // Test Supabase client creation
    try {
      const supabase = createClient()
      console.log('✅ Supabase client created:', supabase)
      
      // Test auth methods availability
      console.log('🔐 Auth methods available:', {
        signUp: typeof supabase.auth.signUp,
        signIn: typeof supabase.auth.signInWithPassword,
        getUser: typeof supabase.auth.getUser,
      })
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error)
    }
  }, [])

  return null
}