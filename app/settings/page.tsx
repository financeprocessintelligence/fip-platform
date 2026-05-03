'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [email, setEmail] = useState('')

  // Organisation fields
  const [orgName, setOrgName] = useState('')
  const [industry, setIndustry] = useState('')
  const [orgSize, setOrgSize] = useState('')

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      setEmail(user.email || '')
      setFullName(user.user_metadata?.full_name || '')
      setJobTitle(user.user_metadata?.job_title || '')
      setOrgName(user.user_metadata?.org_name || '')
      setIndustry(user.user_metadata?.industry || '')
      setOrgSize(user.user_metadata?.org_size || '')
      setLoading(false)
    }
    fetchUser()
  }, [router])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, job_title: jobTitle }
    })
    setSaving(false)
    if (error) showMessage('error', 'Failed to update profile. Please try again.')
    else showMessage('success', 'Profile updated successfully.')
  }

  const saveOrganisation = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { org_name: orgName, industry, org_size: orgSize }
    })
    setSaving(false)
    if (error) showMessage('error', 'Failed to update organisation. Please try again.')
    else showMessage('success', 'Organisation details updated successfully.')
  }

  const savePassword = async () => {
    if (newPassword !== confirmPassword) { showMessage('error', 'New passwords do not match.'); return }
    if (newPassword.length < 8) { showMessage('error', 'Password must be at least 8 characters.'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) showMessage('error', 'Failed to update password. Please try again.')
    else {
      showMessage('success', 'Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your assessment data will be permanently lost.')
    if (!confirmed) return
    showMessage('error', 'Please contact support at support@fpi.com to delete your account.')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', background: 'white', boxSizing: 'border-box' as const }
  const labelStyle = { fontSize: '13px', fontWeight: '600' as const, color: '#333', display: 'block' as const, marginBottom: '6px' }

  const sections = [
    { key: 'profile', label: '👤 Profile' },
    { key: 'organisation', label: '🏢 Organisation' },
    { key: 'password', label: '🔒 Password' },
    { key: 'account', label: '⚙️ Account' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading settings...</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: '#0F4C81', color: 'white', padding: '24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>FPI</div>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Finance Process</span>
        </div>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '32px', marginLeft: '46px' }}>Intelligence Platform</p>
        {['Dashboard', 'My Assessments', 'Process Explorer', 'Reports', 'Settings'].map(item => (
          <div key={item} onClick={() => {
            if (item === 'Dashboard') router.push('/dashboard')
            if (item === 'My Assessments') router.push('/my-assessments')
            if (item === 'Process Explorer') router.push('/process-explorer')
            if (item === 'Reports') router.push('/reports')
          }} style={{ padding: '10px 12px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', background: item === 'Settings' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
            {item}
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
          <button onClick={handleSignOut} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#f4f6f9', padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>Settings</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>Manage your account and preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#15803d' : '#dc2626', border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`, fontSize: '14px', fontWeight: '500' }}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
          {/* Section Nav */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', height: 'fit-content' }}>
            {sections.map(s => (
              <div key={s.key} onClick={() => setActiveSection(s.key)} style={{ padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: activeSection === s.key ? '600' : '400', color: activeSection === s.key ? '#0F4C81' : '#555', background: activeSection === s.key ? '#e8f4fd' : 'transparent', marginBottom: '4px' }}>
                {s.label}
              </div>
            ))}
          </div>

          {/* Section Content */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>

            {activeSection === 'profile' && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>Profile</h2>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Update your personal information</p>

                {/* Avatar placeholder */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', padding: '16px', background: '#f4f6f9', borderRadius: '8px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0F4C81', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: 'white', fontWeight: 'bold' }}>
                    {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>{fullName || 'Your Name'}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{email}</div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Profile photo upload coming soon</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Job Title</label>
                    <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Head of FP&A" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input value={email} disabled style={{ ...inputStyle, background: '#f4f6f9', color: '#999', cursor: 'not-allowed' }} />
                    <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Email address cannot be changed</p>
                  </div>
                  <button onClick={saveProfile} disabled={saving} style={{ padding: '11px 24px', background: saving ? '#ccc' : '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'default' : 'pointer', alignSelf: 'flex-start' }}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'organisation' && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>Organisation</h2>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Update your organisation details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Organisation Name</label>
                    <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Your organisation name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <select value={industry} onChange={e => setIndustry(e.target.value)} style={inputStyle}>
                      <option value="">Select industry</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Defence">Defence</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Government">Government</option>
                      <option value="Media">Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Organisation Size</label>
                    <select value={orgSize} onChange={e => setOrgSize(e.target.value)} style={inputStyle}>
                      <option value="">Select size</option>
                      <option value="1-50">1–50 employees</option>
                      <option value="51-200">51–200 employees</option>
                      <option value="201-1000">201–1,000 employees</option>
                      <option value="1001-5000">1,001–5,000 employees</option>
                      <option value="5000+">5,000+ employees</option>
                    </select>
                  </div>
                  <button onClick={saveOrganisation} disabled={saving} style={{ padding: '11px 24px', background: saving ? '#ccc' : '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'default' : 'pointer', alignSelf: 'flex-start' }}>
                    {saving ? 'Saving...' : 'Save Organisation'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'password' && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>Password</h2>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Change your account password</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" style={inputStyle} />
                  </div>
                  <button onClick={savePassword} disabled={saving || !newPassword || !confirmPassword} style={{ padding: '11px 24px', background: saving || !newPassword || !confirmPassword ? '#ccc' : '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: saving || !newPassword || !confirmPassword ? 'default' : 'pointer', alignSelf: 'flex-start' }}>
                    {saving ? 'Saving...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>Account</h2>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Manage your account settings</p>

                <div style={{ padding: '20px', background: '#f4f6f9', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>Account Information</div>
                  <div style={{ fontSize: '13px', color: '#555', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><span style={{ color: '#999' }}>Email: </span>{email}</div>
                    <div><span style={{ color: '#999' }}>Organisation: </span>{orgName || 'Not set'}</div>
                    <div><span style={{ color: '#999' }}>Industry: </span>{industry || 'Not set'}</div>
                  </div>
                </div>

                <div style={{ padding: '20px', background: '#fff5f5', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>Danger Zone</div>
                  <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>Once you delete your account, all your assessment data will be permanently removed. This action cannot be undone.</p>
                  <button onClick={handleDeleteAccount} style={{ padding: '10px 20px', background: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}