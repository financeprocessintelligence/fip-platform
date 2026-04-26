'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    fullName: '',
    jobTitle: '',
    email: '',
    password: '',
    roleType: '',
    orgName: '',
    industry: '',
    orgSize: '',
    currency: '£',
    revenue: '',
  })
  const [message, setMessage] = useState('')

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          job_title: form.jobTitle,
          role_type: form.roleType,
          org_name: form.orgName,
          industry: form.industry,
          org_size: form.orgSize,
          revenue: form.revenue ? `${form.currency} ${form.revenue}` : '',
        }
      }
    })
    if (error) setMessage(error.message)
    else setMessage('Account created! Check your email to confirm, then sign in.')
  }

  const inputStyle = { display: 'block', width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', background: 'white' }
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '280px', background: '#0F2744', padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', color: 'white' }}>FPI</div>
          <div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Finance Process</div>
            <div style={{ color: '#7db3e8', fontSize: '10px', letterSpacing: '0.08em' }}>INTELLIGENCE PLATFORM</div>
          </div>
        </div>
        {['Account details', 'Role type', 'Organisation'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0, background: step > i + 1 ? '#1d9e75' : step === i + 1 ? 'white' : 'rgba(255,255,255,0.15)', color: step === i + 1 ? '#0F2744' : 'white' }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '13px', color: step === i + 1 ? 'white' : '#7db3e8', fontWeight: step === i + 1 ? '600' : '400' }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, background: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '480px', background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

          {step === 1 && (
            <>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Create your account</h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Start your FPI journey</p>
              <label style={labelStyle}>Full name</label>
              <input style={inputStyle} type="text" placeholder="Your full name" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
              <label style={labelStyle}>Job title</label>
              <input style={inputStyle} type="text" placeholder="e.g. CFO, Finance Manager" value={form.jobTitle} onChange={e => update('jobTitle', e.target.value)} />
              <label style={labelStyle}>Email address</label>
              <input style={inputStyle} type="email" placeholder="you@organisation.com" value={form.email} onChange={e => update('email', e.target.value)} />
              <label style={labelStyle}>Password</label>
              <input style={{ ...inputStyle, marginBottom: '24px' }} type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} />
              <button onClick={() => setStep(2)} style={{ width: '100%', padding: '12px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                Continue →
              </button>
              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#666' }}>Already have an account? <span onClick={() => router.push('/')} style={{ color: '#0F4C81', cursor: 'pointer', fontWeight: '600' }}>Sign in</span></p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>What best describes you?</h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Select your role type</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {[
                  { type: 'Business', desc: 'Finance professional within an organisation', icon: '🏢' },
                  { type: 'Partner', desc: 'Consultant or advisor serving clients', icon: '🤝' },
                ].map(r => (
                  <div key={r.type} onClick={() => update('roleType', r.type)} style={{ padding: '20px', borderRadius: '8px', border: `2px solid ${form.roleType === r.type ? '#0F4C81' : '#e0e4ea'}`, cursor: 'pointer', background: form.roleType === r.type ? '#f0f5ff' : 'white', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{r.icon}</div>
                    <div style={{ fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>{r.type}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>← Back</button>
                <button onClick={() => setStep(3)} disabled={!form.roleType} style={{ flex: 1, padding: '12px', background: form.roleType ? '#0F4C81' : '#ccc', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: form.roleType ? 'pointer' : 'default' }}>Continue →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Your organisation</h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Tell us about where you work</p>
              <label style={labelStyle}>Organisation name</label>
              <input style={inputStyle} type="text" placeholder="Company or firm name" value={form.orgName} onChange={e => update('orgName', e.target.value)} />
              <label style={labelStyle}>Industry</label>
              <select style={inputStyle} value={form.industry} onChange={e => update('industry', e.target.value)}>
                <option value="">Select industry</option>
                <option>Defence</option>
                <option>Manufacturing</option>
                <option>Government</option>
                <option>Media</option>
                <option>Financial Services</option>
                <option>Other</option>
              </select>
              <label style={labelStyle}>Organisation size</label>
              <select style={inputStyle} value={form.orgSize} onChange={e => update('orgSize', e.target.value)}>
                <option value="">Select size</option>
                <option>1–50 employees</option>
                <option>51–250 employees</option>
                <option>251–1,000 employees</option>
                <option>1,001–5,000 employees</option>
                <option>5,000+ employees</option>
              </select>
              <label style={labelStyle}>Annual revenue <span style={{ color: '#999', fontWeight: '400' }}>(optional)</span></label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <select value={form.currency} onChange={e => update('currency', e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', background: 'white', width: '80px' }}>
                  <option>£</option>
                  <option>$</option>
                  <option>€</option>
                  <option>₹</option>
                  <option>¥</option>
                  <option>A$</option>
                  <option>C$</option>
                </select>
                <select value={form.revenue} onChange={e => update('revenue', e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', background: 'white' }}>
                  <option value="">Prefer not to say</option>
                  <option>Under 1M</option>
                  <option>1M – 10M</option>
                  <option>10M – 100M</option>
                  <option>100M – 1B</option>
                  <option>Over 1B</option>
                </select>
              </div>

              {message && <p style={{ color: message.includes('error') ? 'red' : 'green', fontSize: '13px', marginBottom: '12px' }}>{message}</p>}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>← Back</button>
                <button onClick={handleSubmit} style={{ flex: 1, padding: '12px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Create Account</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}