'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Assessment = {
  process_name: string
  step_code: string
  score: number | null
  updated_at: string
}

type ProcessSummary = {
  processName: string
  totalSteps: number
  completedSteps: number
  averageScore: number
  level: string
  lastUpdated: string
  status: 'completed' | 'in-progress' | 'not-started'
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

const availableProcesses = [
  { name: 'Plan to Perform', code: 'p2p', totalSteps: 7, available: true, description: 'Strategic planning, budgeting, forecasting and performance management' },
  { name: 'Record to Report', code: 'r2r', totalSteps: 12, available: true, description: 'General ledger, financial consolidation and period end reporting' },
  { name: 'Quote to Cash', code: 'q2c', totalSteps: 8, available: false, description: 'Order management, billing and revenue recognition' },
  { name: 'Project to Result', code: 'p2r', totalSteps: 6, available: false, description: 'Project accounting, cost management and delivery' },
  { name: 'Source to Pay', code: 's2p', totalSteps: 8, available: false, description: 'Procurement, supplier management and accounts payable' },
  { name: 'Acquire to Retire', code: 'a2r', totalSteps: 6, available: false, description: 'Asset management, depreciation and disposal' },
  { name: 'Transact to Record', code: 't2r', totalSteps: 7, available: false, description: 'Transaction processing and accounting operations' },
]

export default function MyAssessmentsPage() {
  const router = useRouter()
  const [processSummaries, setProcessSummaries] = useState<ProcessSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessments = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data, error } = await supabase
        .from('assessments')
        .select('process_name, step_code, score, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error || !data) { setLoading(false); return }

      const rows = data as Assessment[]

      // Group by process
      const processMap: Record<string, Assessment[]> = {}
      rows.forEach(row => {
        if (!processMap[row.process_name]) processMap[row.process_name] = []
        processMap[row.process_name].push(row)
      })

      const summaries: ProcessSummary[] = Object.entries(processMap).map(([processName, assessments]) => {
        const scoredRows = assessments.filter(a => a.score !== null)
        const uniqueSteps = [...new Set(assessments.map(a => a.step_code))]
        const processConfig = availableProcesses.find(p => p.name === processName)
        const totalSteps = processConfig?.totalSteps || 7
        const averageScore = scoredRows.length > 0
          ? parseFloat((scoredRows.reduce((sum, a) => sum + (a.score || 0), 0) / scoredRows.length).toFixed(1))
          : 0
        const lastUpdated = assessments[0]?.updated_at || ''
        const completedSteps = uniqueSteps.length
        const status: 'completed' | 'in-progress' | 'not-started' =
          completedSteps >= totalSteps ? 'completed' : completedSteps > 0 ? 'in-progress' : 'not-started'

        return {
          processName,
          totalSteps,
          completedSteps,
          averageScore,
          level: averageScore > 0 ? getLevel(averageScore) : 'Not started',
          lastUpdated,
          status
        }
      })

      setProcessSummaries(summaries)
      setLoading(false)
    }

    fetchAssessments()
  }, [router])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const startedProcessNames = processSummaries.map(p => p.processName)
  const notStartedProcesses = availableProcesses.filter(p => !startedProcessNames.includes(p.name))

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
            if (item === 'Settings') router.push('/settings')
          }} style={{ padding: '10px 12px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', background: item === 'My Assessments' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#f4f6f9', padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>My Assessments</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>Track your progress and view results across all Finance processes</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>⏳ Loading your assessments...</div>
        ) : (
          <>
            {/* Completed / In Progress Assessments */}
            {processSummaries.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>Your Assessments</h2>
                {processSummaries.map((p, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px', borderLeft: `4px solid ${p.status === 'completed' ? '#1d9e75' : '#f97316'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>{p.processName}</h3>
                          <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: p.status === 'completed' ? '#f0fdf4' : '#fff7ed', color: p.status === 'completed' ? '#1d9e75' : '#f97316' }}>
                            {p.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>OVERALL SCORE</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: p.averageScore > 0 ? getLevelColor(p.level) : '#999' }}>
                              {p.averageScore > 0 ? p.averageScore : '-'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>MATURITY LEVEL</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: getLevelColor(p.level) }}>{p.level}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>PROGRESS</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{p.completedSteps} of {p.totalSteps} steps</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>LAST UPDATED</div>
                            <div style={{ fontSize: '14px', color: '#666' }}>{formatDate(p.lastUpdated)}</div>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '6px', width: '300px' }}>
                          <div style={{ width: `${(p.completedSteps / p.totalSteps) * 100}%`, background: p.status === 'completed' ? '#1d9e75' : '#f97316', height: '100%', borderRadius: '4px' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                        {p.status === 'completed' || p.averageScore > 0 ? (
                          <button onClick={() => router.push(p.processName === 'Record to Report' ? '/results-r2r' : '/results')} style={{ padding: '10px 20px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            View Results →
                          </button>
                        ) : null}
                        <button onClick={() => router.push('/assessment')} style={{ padding: '10px 20px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          {p.status === 'in-progress' ? 'Continue →' : 'Retake'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Start New Assessment */}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>Start New Assessment</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {notStartedProcesses.map((p, i) => (
                  <div key={i} style={{ background: p.available ? 'white' : '#f8f8f8', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', opacity: p.available ? 1 : 0.6, borderLeft: `4px solid ${p.available ? '#0F4C81' : '#ddd'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: p.available ? '#1a1a2e' : '#999' }}>{p.name}</h3>
                      {!p.available && <span style={{ fontSize: '11px', color: '#aaa', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>🔒 Coming Soon</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>{p.description}</p>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>{p.totalSteps} L2 processes · ~{p.totalSteps * 15} mins</div>
                    {p.available && (
                      <button onClick={() => router.push('/assessment')} style={{ padding: '8px 18px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        Start Assessment →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {processSummaries.length === 0 && notStartedProcesses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No assessments yet</div>
                <div style={{ fontSize: '14px', marginBottom: '24px' }}>Start your first assessment to see your maturity scores here</div>
                <button onClick={() => router.push('/process-explorer')} style={{ padding: '12px 24px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Explore Processes →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}