'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else router.push('/dashboard')
  }

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Check your email to confirm your account!')
  }

  const processes = ['Plan to Perform', 'Record to Report', 'Quote to Cash', 'Project to Result', 'Source to Pay', 'Acquire to Retire', 'Transact to Record']

  const inputStyle = { display: 'block', width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', background: 'white' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Left Panel */}
      <div style={{ width: '55%', background: '#0F2744', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '40px', height: '40px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'white' }}>FPI</div>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Finance Process</div>
              <div style={{ color: '#7db3e8', fontSize: '11px', letterSpacing: '0.08em' }}>INTELLIGENCE PLATFORM</div>
            </div>
          </div>

          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '600', lineHeight: '1.4', marginBottom: '16px' }}>
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

          <div style={{ display: 'flex', gap: '32px' }}>
            {[['7', 'L2 Process Domains'], ['5', 'Maturity Levels'], ['AI', 'Powered Insights']].map(([val, label]) => (
              <div key={label}>
                <div style={{ color: '#4fa3e0', fontSize: '28px', fontWeight: 'bold' }}>{val}</div>
                <div style={{ color: '#7db3e8', fontSize: '12px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: '#4a6a8a', fontSize: '12px' }}>© 2026 Finance Process Intelligence. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div style={{ width: '45%', background: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
            {tab === 'login' ? 'Sign in to your account' : 'Start your free assessment today'}
          </p>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#e0e4ea', borderRadius: '8px', padding: '4px' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', background: tab === t ? 'white' : 'transparent', color: tab === t ? '#0F4C81' : '#666', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {tab === 'register' && (
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />

          <button onClick={tab === 'login' ? handleLogin : handleSignup}
            style={{ width: '100%', padding: '12px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            {tab === 'login' ? 'Sign in to platform' : 'Create account'}
          </button>

          {message && <p style={{ marginTop: '12px', color: 'red', fontSize: '13px' }}>{message}</p>}
        </div>
      </div>
    </div>
  )
}