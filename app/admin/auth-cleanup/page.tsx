'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthCleanupPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkAuthStatus = async () => {
    if (!email) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const supabase = createClient()
      
      // Check current session
      const { data: sessionData } = await supabase.auth.getSession()
      
      // Check user data
      const { data: userData } = await supabase.auth.getUser()
      
      // Try to get user by email from auth.users (this requires service role)
      // We'll use the admin API to check
      const response = await fetch('/api/admin/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const adminData = await response.json()
      
      setResult({
        session: sessionData,
        user: userData,
        admin: adminData,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error checking auth status:', error)
      setResult({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const cleanupUser = async () => {
    if (!email) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/cleanup-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const result = await response.json()
      setResult(result)
    } catch (error) {
      console.error('Error cleaning up user:', error)
      setResult({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const resetAuth = async () => {
    setLoading(true)
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      setResult({ message: 'Auth reset complete' })
    } catch (error) {
      console.error('Error resetting auth:', error)
      setResult({ error: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase Auth Cleanup Tool</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">⚠️ Admin Tool</h2>
          <p className="text-red-700 text-sm">
            This tool is for debugging and fixing authentication inconsistencies. 
            Use with caution as it can permanently delete user data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Check Auth Status</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email to check"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={checkAuthStatus}
                disabled={loading || !email}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Cleanup Actions</h2>
            <div className="space-y-4">
              <button
                onClick={cleanupUser}
                disabled={loading || !email}
                className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Cleaning...' : 'Clean Up User'}
              </button>
              <button
                onClick={resetAuth}
                disabled={loading}
                className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Current Auth'}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Result</h2>
            <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Use</h3>
          <ol className="text-blue-700 text-sm space-y-1">
            <li>1. Enter the problematic email address</li>
            <li>2. Click "Check Status" to see auth/user data inconsistencies</li>
            <li>3. If data is corrupted, click "Clean Up User" to remove all traces</li>
            <li>4. User can then re-register with same or different email</li>
            <li>5. Use "Reset Current Auth" to clear browser session/cache</li>
          </ol>
        </div>
      </div>
    </div>
  )
}