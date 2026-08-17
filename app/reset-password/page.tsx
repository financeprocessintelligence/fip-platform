'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setValidSession(true)
      else setMessage('This reset link is invalid or has expired. Please request a new one.')
    }
    checkSession()
  }, [])

  const handleReset = async () => {
    if (!password) { setMessage('Please enter a new password.'); return }
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) { setMessage('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  const inputStyle = { display: 'block', width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', background: 'white', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', background: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', background: '#0F4C81', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', color: 'white' }}>FPI</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a1a2e' }}>Finance Process</div>
            <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.08em' }}>INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Password updated!</h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Your password has been successfully reset. You can now sign in with your new password.</p>
              <button onClick={() => router.push('/')} style={{ width: '100%', padding: '12px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                Sign in to platform
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Set new password</h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Enter your new password below.</p>
              {!validSession && message ? (
                <>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
                    <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{message}</p>
                  </div>
                  <button onClick={() => router.push('/')} style={{ width: '100%', padding: '12px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                    ← Back to sign in
                  </button>
                </>
              ) : (
                <>
                  <input type="password" placeholder="New password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                  <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReset()} style={{ ...inputStyle, marginBottom: '20px' }} />
                  {message && <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px' }}>{message}</p>}
                  <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#ccc' : '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'default' : 'pointer', marginBottom: '12px' }}>
                    {loading ? 'Updating...' : 'Update password'}
                  </button>
                  <button onClick={() => router.push('/')} style={{ width: '100%', padding: '12px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                    ← Back to sign in
                  </button>
                </>
              )}
            </>
          )}
        </div>
        <p style={{ color: '#999', fontSize: '11px', marginTop: '24px', textAlign: 'center' }}>© 2026 Finance Process Intelligence. All rights reserved.</p>
      </div>
    </div>
  )
}
