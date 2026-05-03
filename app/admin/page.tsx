'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type User = {
  id: string
  email: string
  full_name: string
  org_name: string
  industry: string
  org_size: string
  job_title: string
  created_at: string
  role_type: string
}

type Assessment = {
  user_id: string
  process_name: string
  score: number | null
  updated_at: string
}

type UserSummary = {
  id: string
  email: string
  full_name: string
  org_name: string
  industry: string
  job_title: string
  created_at: string
  assessments: { processName: string; score: number; lastUpdated: string }[]
}

function getLevel(score: number): string {
  if (score < 2) return 'Initial'
  if (score < 3) return 'Repeatable'
  if (score < 4) return 'Defined'
  if (score < 5) return 'Managed'
  return 'Optimised'
}

function getLevelColor(level: string): string {
  const colors: Record<string, string> = { 'Initial': '#ef4444', 'Repeatable': '#f97316', 'Defined': '#eab308', 'Managed': '#22c55e', 'Optimised': '#3b82f6' }
  return colors[level] || '#666'
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<UserSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    avgScore: 0,
    byIndustry: {} as Record<string, number>,
  })

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      // Check admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) { router.push('/dashboard'); return }

      // Fetch all users via secure API route
      const res = await fetch('/api/admin/users')
      const authUsers = await res.json()

      // Fetch all assessments
      const { data: assessments } = await supabase
        .from('assessments')
        .select('user_id, process_name, score, updated_at')

      const assessmentRows = (assessments || []) as Assessment[]

      // Build user summaries
      const userList: UserSummary[] = (authUsers?.users || authUsers || []).map(u => {
        const userAssessments = assessmentRows.filter(a => a.user_id === u.id)
        const processMap: Record<string, Assessment[]> = {}
        userAssessments.forEach(a => {
          if (!processMap[a.process_name]) processMap[a.process_name] = []
          processMap[a.process_name].push(a)
        })

        const processSummaries = Object.entries(processMap).map(([processName, rows]) => {
          const scored = rows.filter(r => r.score !== null)
          const avg = scored.length > 0 ? parseFloat((scored.reduce((sum, r) => sum + (r.score || 0), 0) / scored.length).toFixed(1)) : 0
          return { processName, score: avg, lastUpdated: rows[0]?.updated_at || '' }
        })

        return {
          id: u.id,
          email: u.email || '',
          full_name: u.user_metadata?.full_name || '',
          org_name: u.user_metadata?.org_name || '',
          industry: u.user_metadata?.industry || '',
          job_title: u.user_metadata?.job_title || '',
          created_at: u.created_at || '',
          assessments: processSummaries
        }
      })

      setUsers(userList)

      // Calculate stats
      const allScored = assessmentRows.filter(a => a.score !== null)
      const avgScore = allScored.length > 0 ? parseFloat((allScored.reduce((sum, a) => sum + (a.score || 0), 0) / allScored.length).toFixed(1)) : 0
      const byIndustry: Record<string, number> = {}
      userList.forEach(u => { if (u.industry) byIndustry[u.industry] = (byIndustry[u.industry] || 0) + 1 })

      setStats({
        totalUsers: userList.length,
        totalAssessments: [...new Set(assessmentRows.map(a => `${a.user_id}-${a.process_name}`))].length,
        avgScore,
        byIndustry,
      })

      setLoading(false)
    }

    checkAdminAndFetch()
  }, [router])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.org_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading admin dashboard...</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', background: '#f4f6f9' }}>
      {/* Header */}
      <div style={{ background: '#0F2744', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#4fa3e0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>FPI Platform</div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>Admin Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>← Back to App</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'white', borderBottom: '1px solid #e0e4ea', padding: '0 40px', display: 'flex' }}>
        {['overview', 'users', 'assessments'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '14px 20px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: activeTab === tab ? '700' : '400', color: activeTab === tab ? '#0F4C81' : '#666', borderBottom: activeTab === tab ? '2px solid #0F4C81' : '2px solid transparent', cursor: 'pointer' }}>
            {tab === 'overview' ? 'Overview' : tab === 'users' ? 'Users' : 'Assessments'}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 40px' }}>
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Total Users', value: stats.totalUsers.toString(), color: '#0F4C81' },
                { label: 'Total Assessments', value: stats.totalAssessments.toString(), color: '#1d9e75' },
                { label: 'Avg Maturity Score', value: stats.avgScore > 0 ? stats.avgScore.toString() : 'N/A', color: '#f97316' },
                { label: 'Industries Represented', value: Object.keys(stats.byIndustry).length.toString(), color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Industry Breakdown */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>Users by Industry</h3>
              {Object.entries(stats.byIndustry).length === 0 ? (
                <p style={{ color: '#999', fontSize: '14px' }}>No industry data available yet</p>
              ) : (
                Object.entries(stats.byIndustry).map(([industry, count]) => (
                  <div key={industry} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <div style={{ width: '160px', fontSize: '13px', color: '#444' }}>{industry}</div>
                    <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '4px', height: '10px' }}>
                      <div style={{ width: `${(count / stats.totalUsers) * 100}%`, background: '#0F4C81', height: '100%', borderRadius: '4px' }} />
                    </div>
                    <div style={{ width: '30px', fontSize: '14px', fontWeight: '700', color: '#0F4C81', textAlign: 'right' }}>{count}</div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Users */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>Recently Registered Users</h3>
              {users.slice(0, 5).map((u, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0F4C81', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
                    {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{u.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{u.email} · {u.org_name || 'No org'}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{formatDate(u.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>All Users ({users.length})</h2>
              <input
                type="text"
                placeholder="Search by name, email or organisation..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', width: '300px' }}
              />
            </div>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f4f6f9' }}>
                    {['Name', 'Email', 'Organisation', 'Industry', 'Job Title', 'Registered', 'Assessments'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{u.full_name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>{u.org_name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>{u.industry || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>{u.job_title || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>{formatDate(u.created_at)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.assessments.length === 0 ? (
                          <span style={{ fontSize: '12px', color: '#999' }}>None</span>
                        ) : (
                          u.assessments.map((a, j) => (
                            <span key={j} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: '#f0fdf4', color: '#1d9e75', marginRight: '4px', marginBottom: '2px' }}>
                              {a.processName.split(' ').map(w => w[0]).join('')} {a.score}
                            </span>
                          ))
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No users found matching your search</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px' }}>All Assessments</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {users.filter(u => u.assessments.length > 0).map((u, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0F4C81', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
                      {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>{u.full_name || u.email}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{u.org_name || 'No org'} · {u.industry || 'No industry'}</div>
                    </div>
                  </div>
                  {u.assessments.map((a, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f4f6f9', borderRadius: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#444' }}>{a.processName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: getLevelColor(getLevel(a.score)), color: 'white' }}>{getLevel(a.score)}</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: getLevelColor(getLevel(a.score)) }}>{a.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {users.filter(u => u.assessments.length > 0).length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '48px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#999' }}>No assessments completed yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}