'use client'

import { useState } from 'react'

export default function EmergencyFixPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const scanCorruption = async () => {
    if (!email) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/admin/emergency-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'scan' })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Scan error:', error)
      setResult({ error: 'Scan failed', details: error })
    } finally {
      setLoading(false)
    }
  }

  const emergencyCleanup = async () => {
    if (!email) return
    
    const confirmed = confirm(
      `⚠️ EMERGENCY CLEANUP\n\nThis will PERMANENTLY DELETE all data for: ${email}\n\nThe user will need to re-register. Continue?`
    )
    
    if (!confirmed) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/emergency-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'cleanup' })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Cleanup error:', error)
      setResult({ error: 'Cleanup failed', details: error })
    } finally {
      setLoading(false)
    }
  }

  const suggestEmails = async () => {
    if (!email) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/emergency-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'suggest_email' })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Suggestion error:', error)
      setResult({ error: 'Email suggestion failed', details: error })
    } finally {
      setLoading(false)
    }
  }

  const clearBrowserCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Force reload to clear any in-memory state
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen p-8 bg-red-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-red-800 mb-2">🚨 EMERGENCY AUTH REPAIR</h1>
          <p className="text-red-700">
            This tool fixes critical Supabase authentication corruption where users exist in database 
            but Auth API considers them invalid.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input and Actions */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
              <h2 className="text-xl font-semibold mb-4 text-red-800">Corrupted Email</h2>
              <input
                type="email"
                placeholder="Enter corrupted email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 rounded-lg mb-4 focus:border-red-500"
              />
              
              <div className="space-y-3">
                <button
                  onClick={scanCorruption}
                  disabled={loading || !email}
                  className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '🔍 Scanning...' : '🔍 Scan for Corruption'}
                </button>
                
                <button
                  onClick={emergencyCleanup}
                  disabled={loading || !email}
                  className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? '🧹 Cleaning...' : '🧹 EMERGENCY CLEANUP'}
                </button>
                
                <button
                  onClick={suggestEmails}
                  disabled={loading || !email}
                  className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? '💡 Generating...' : '💡 Suggest Clean Emails'}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">Browser Cache</h2>
              <button
                onClick={clearBrowserCache}
                className="w-full p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                🔄 Clear Browser Cache & Reload
              </button>
              <p className="text-sm text-yellow-700 mt-2">
                Clears localStorage, sessionStorage, and reloads page
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">📋 Emergency Fix Process</h2>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                <div>
                  <strong>Scan for Corruption:</strong> Identify what's wrong with the user data
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                <div>
                  <strong>Emergency Cleanup:</strong> Completely remove corrupted user from all tables
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                <div>
                  <strong>Clear Browser Cache:</strong> Remove any cached authentication state
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                <div>
                  <strong>Re-register:</strong> User can now register with same or new email
                </div>
              </li>
            </ol>
            
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Warning</h3>
              <p className="text-red-700 text-sm">
                Emergency cleanup permanently deletes user data. Only use when normal cleanup fails.
                User will need to re-register and lose any associated data.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {result.corruption_detected ? '⚠️ Corruption Detected' : '✅ Results'}
            </h2>
            
            {result.suggested_emails && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">💡 Suggested Clean Email Addresses:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.suggested_emails.map((email: string, i: number) => (
                    <li key={i} className="text-green-700 font-mono text-sm">{email}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.cleanup_completed && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">✅ Cleanup Completed Successfully!</h3>
                <p className="text-green-700 text-sm">User can now re-register with the same email address.</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Detailed Log:</h3>
              <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                {result.steps ? result.steps.join('\n') : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}