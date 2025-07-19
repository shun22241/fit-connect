'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// Hardcoded values for testing
const SUPABASE_URL = 'https://rzbnnvgccvopjxigiisx.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Ym5udmdjY3ZvcGp4aWdpaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjA5MDQsImV4cCI6MjA2ODM5NjkwNH0.piiyaa3Sofym3dnNfsJfAgGuCb2XXsLubQvWPNPxrIk'

export default function TestSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignup = async () => {
    setLoading(true)
    console.log('🚀 Testing signup with hardcoded values...')

    try {
      // Create client with hardcoded values
      const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      console.log('✅ Client created with hardcoded values')

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('📊 Full response:', { data, error })
      setResult({ data, error })
    } catch (err: any) {
      console.error('❌ Error:', err)
      setResult({ error: err })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase Signup Test</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm font-mono">
            <p>
              Process env URL:{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
            </p>
            <p>
              Process env Key:{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}
            </p>
            <p>Hardcoded URL: {SUPABASE_URL}</p>
            <p>Hardcoded Key: {SUPABASE_ANON_KEY.substring(0, 20)}...</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Signup</h2>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={testSignup}
              disabled={loading}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Signup'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Result</h2>
            <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
