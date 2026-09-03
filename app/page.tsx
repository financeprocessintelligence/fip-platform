'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else router.push('/dashboard')
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) { setResetMessage('Please enter your email address.'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setResetMessage(error.message)
    else setResetSent(true)
  }

  const processes = ['Plan to Perform', 'Record to Report', 'Quote to Cash', 'Project to Result', 'Source to Procure', 'Procure to Pay', 'Acquire to Retire', 'Transact to Record']

  const inputStyle = { display: 'block', width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', background: 'white', boxSizing: 'border-box' as const }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .fpi-container { flex-direction: column !important; }
          .fpi-left { width: 100% !important; padding: 32px 24px !important; }
          .fpi-right { width: 100% !important; padding: 32px 24px !important; min-height: auto !important; }
          .fpi-title { font-size: 26px !important; }
          .fpi-stats { gap: 20px !important; }
          .fpi-copyright { display: none !important; }
        }
      `}</style>
      <div className="fpi-container" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div className="fpi-left" style={{ width: '55%', background: '#0F2744', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <div style={{ width: '40px', height: '40px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'white', flexShrink: 0 }}>FPI</div>
              <div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Finance Process</div>
                <div style={{ color: '#7db3e8', fontSize: '11px', letterSpacing: '0.08em' }}>INTELLIGENCE PLATFORM</div>
              </div>
            </div>
            <h1 className="fpi-title" style={{ color: 'white', fontSize: '32px', fontWeight: '600', lineHeight: '1.4', marginBottom: '16px' }}>
              Assess. Benchmark.<br />Transform your Finance function.
            </h1>
            <p style={{ color: '#a8c8e8', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>
              The only platform that gives you a structured maturity assessment across all Finance business processes — in hours, not months.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
              {processes.map(p => (
                <span key={p} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: '#a8c8e8', border: '1px solid rgba(255,255,255,0.15)' }}>{p}</span>
              ))}
            </div>
            <div className="fpi-stats" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[['8', 'L2 Process Domains'], ['5', 'Maturity Levels'], ['AI', 'Powered Insights']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ color: '#4fa3e0', fontSize: '28px', fontWeight: 'bold' }}>{val}</div>
                  <div style={{ color: '#7db3e8', fontSize: '12px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fpi-copyright" style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
  <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px' }}>
  <div style={{ fontSize: '11px', color: '#7db3e8', marginBottom: '8px', letterSpacing: '0.06em' }}>DELIVERED BY</div>
  <img src="/images/arpero-logo-white.png" alt="Arpero" style={{ height: '100px', width: 'auto', maxWidth: '300px', opacity: 1 }} />
</div>
  <p style={{ color: '#4a6a8a', fontSize: '12px', margin: 0 }}>© 2026 Finance Process Intelligence. All rights reserved.</p>
</div>
        </div>

        <div className="fpi-right" style={{ width: '45%', background: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>

            {!showReset ? (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Welcome back</h2>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Sign in to your account</p>
                <input type="email" placeholder="Work email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...inputStyle, marginBottom: '8px' }} />
                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                  <span onClick={() => { setShowReset(true); setResetEmail(email); setMessage('') }} style={{ fontSize: '13px', color: '#0F4C81', cursor: 'pointer', fontWeight: '600' }}>Forgot password?</span>
                </div>
                <button onClick={handleLogin} style={{ width: '100%', padding: '12px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
                  Sign in to platform
                </button>
                <button onClick={() => router.push('/register')} style={{ width: '100%', padding: '12px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  Create new account
                </button>
                {message && <p style={{ marginTop: '12px', color: 'red', fontSize: '13px' }}>{message}</p>}
              </>
            ) : (
              <>
                {!resetSent ? (
                  <>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Reset your password</h2>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Enter your work email and we'll send you a reset link.</p>
                    <input type="email" placeholder="Work email address" value={resetEmail} onChange={e => setResetEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePasswordReset()} style={inputStyle} />
                    {resetMessage && <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px' }}>{resetMessage}</p>}
                    <button onClick={handlePasswordReset} style={{ width: '100%', padding: '12px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
                      Send reset link
                    </button>
                    <button onClick={() => { setShowReset(false); setResetMessage('') }} style={{ width: '100%', padding: '12px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                      ← Back to sign in
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Check your email</h2>
                      <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>We've sent a password reset link to <strong>{resetEmail}</strong>. Click the link in the email to set a new password.</p>
                      <button onClick={() => { setShowReset(false); setResetSent(false); setResetMessage('') }} style={{ width: '100%', padding: '12px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                        ← Back to sign in
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            <p style={{ color: '#999', fontSize: '11px', marginTop: '24px', textAlign: 'center' }}>© 2026 Finance Process Intelligence. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  )
}
