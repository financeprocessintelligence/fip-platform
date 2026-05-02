'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('Ravi')
  const [assessmentsCompleted, setAssessmentsCompleted] = useState(0)
  const [overallMaturity, setOverallMaturity] = useState('N/A')

  const processes = [
    { name: 'Plan to Perform', code: 'P2P', color: '#0F4C81', available: true },
    { name: 'Record to Report', code: 'R2R', color: '#1a6b5c', available: true },
    { name: 'Quote to Cash', code: 'Q2C', color: '#7b3fa0', available: false },
    { name: 'Project to Result', code: 'P2R', color: '#b8600a', available: false },
    { name: 'Source to Pay', code: 'S2P', color: '#1a5276', available: false },
    { name: 'Acquire to Retire', code: 'A2R', color: '#6b1a1a', available: false },
    { name: 'Transact to Record', code: 'T2R', color: '#1a6b3c', available: false },
  ]

  const navItems = ['Dashboard', 'My Assessments', 'Process Explorer', 'Reports', 'Settings']

  const handleNav = (item: string) => {
    if (item === 'Process Explorer') router.push('/process-explorer')
    if (item === 'My Assessments') router.push('/my-assessments')
    if (item === 'Reports') router.push('/reports')
  }

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserName(user.user_metadata?.full_name || 'Ravi')

      const { data } = await supabase
        .from('assessments')
        .select('process_name, score')
        .eq('user_id', user.id)

      if (!data) return

      // Count unique processes with at least one score
      const processesWithScores = [...new Set(data.filter(r => r.score !== null).map(r => r.process_name))]
      setAssessmentsCompleted(processesWithScores.length)

      // Calculate overall maturity
      const scoredRows = data.filter(r => r.score !== null)
      if (scoredRows.length > 0) {
        const avg = scoredRows.reduce((sum, r) => sum + (r.score || 0), 0) / scoredRows.length
        const score = parseFloat(avg.toFixed(1))
        let level = 'Initial'
        if (score >= 4) level = 'Managed'
        else if (score >= 3) level = 'Defined'
        else if (score >= 2) level = 'Repeatable'
        setOverallMaturity(`${score} — ${level}`)
      }
    }

    fetchStats()
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: '#0F4C81', color: 'white', padding: '24px 16px' }}>
        <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>FPI</div>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Finance Process</span>
          </div>
          <p style={{ fontSize: '11px', color: '#a0c4e8', marginLeft: '46px' }}>Intelligence Platform</p>
        </div>
        <nav>
          {navItems.map(item => (
            <div key={item} onClick={() => handleNav(item)} style={{ padding: '10px 12px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', background: item === 'Dashboard' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
              {item}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f4f6f9', padding: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>Welcome back, {userName}</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>Finance Process Intelligence Platform</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Assessments Completed', value: assessmentsCompleted.toString() },
            { label: 'Processes Available', value: '2' },
            { label: 'Overall Maturity', value: overallMaturity },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0F4C81' }}>{stat.value}</p>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '16px' }}>Finance Process Taxonomy</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {processes.map(p => (
            <div key={p.code} onClick={() => p.available && router.push('/process-explorer')} style={{
              background: p.available ? 'white' : '#f0f0f0',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              borderLeft: `4px solid ${p.available ? p.color : '#ccc'}`,
              cursor: p.available ? 'pointer' : 'default',
              opacity: p.available ? 1 : 0.6,
            }}>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: p.available ? p.color : '#aaa', marginBottom: '6px' }}>{p.code}</p>
              <p style={{ fontSize: '15px', fontWeight: '600', color: p.available ? '#1a1a2e' : '#999' }}>{p.name}</p>
              <p style={{ fontSize: '12px', marginTop: '8px', color: p.available ? '#999' : '#bbb' }}>
                {p.available ? 'Click to explore →' : '🔒 Coming Soon'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}