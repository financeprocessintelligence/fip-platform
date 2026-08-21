'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type AssessmentRow = {
  process_name: string
  step_code: string
  score: number | null
  updated_at: string
}

type ProcessReport = {
  processName: string
  totalSteps: number
  completedSteps: number
  averageScore: number
  level: string
  lastUpdated: string
  status: 'completed' | 'in-progress'
}

const processConfig: Record<string, { totalSteps: number; resultsPath: string; assessmentPath: string; color: string }> = {
  'Plan to Perform': { totalSteps: 7, resultsPath: '/results', assessmentPath: '/assessment', color: '#0F4C81' },
  'Record to Report': { totalSteps: 12, resultsPath: '/results-r2r', assessmentPath: '/assessment-r2r', color: '#1d9e75' },
  'Procure to Pay': { totalSteps: 13, resultsPath: '/results-ptp', assessmentPath: '/assessment-ptp', color: '#0e6655' },
  'Project to Result': { totalSteps: 11, resultsPath: '/results-p2r', assessmentPath: '/assessment-p2r', color: '#6b21a8' },
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

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<ProcessReport[]>([])
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      setOrgName(user.user_metadata?.org_name || 'Your Organisation')

      const { data, error } = await supabase
        .from('assessments')
        .select('process_name, step_code, score, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error || !data) { setLoading(false); return }

      const rows = data as AssessmentRow[]
      const processMap: Record<string, AssessmentRow[]> = {}
      rows.forEach(row => {
        if (!processMap[row.process_name]) processMap[row.process_name] = []
        processMap[row.process_name].push(row)
      })

      const reportList: ProcessReport[] = Object.entries(processMap).map(([processName, assessments]) => {
        const config = processConfig[processName]
        const scoredRows = assessments.filter(a => a.score !== null)
        const uniqueSteps = [...new Set(assessments.map(a => a.step_code))]
        const totalSteps = config?.totalSteps || 7
        const averageScore = scoredRows.length > 0
          ? parseFloat((scoredRows.reduce((sum, a) => sum + (a.score || 0), 0) / scoredRows.length).toFixed(1))
          : 0
        const completedSteps = uniqueSteps.length
        const status: 'completed' | 'in-progress' = completedSteps >= totalSteps ? 'completed' : 'in-progress'
        return { processName, totalSteps, completedSteps, averageScore, level: averageScore > 0 ? getLevel(averageScore) : 'Not started', lastUpdated: assessments[0]?.updated_at || '', status }
      })

      setReports(reportList)
      setLoading(false)
    }
    fetchData()
  }, [router])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const overallAvg = reports.filter(r => r.averageScore > 0).length > 0
    ? parseFloat((reports.filter(r => r.averageScore > 0).reduce((sum, r) => sum + r.averageScore, 0) / reports.filter(r => r.averageScore > 0).length).toFixed(1))
    : 0

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .rep-sidebar { transform: translateX(-100%); position: fixed !important; z-index: 200; height: 100vh; transition: transform 0.3s; overflow-y: auto; }
          .rep-sidebar.open { transform: translateX(0); }
          .rep-topbar { display: flex !important; }
          .rep-main { padding: 16px !important; }
          .rep-stats { grid-template-columns: 1fr !important; gap: 12px !important; }
          .rep-score-grid { grid-template-columns: 1fr 1fr !important; }
          .rep-actions { flex-direction: column !important; }
          .rep-action-btn { width: 100% !important; }
        }
        @media (min-width: 769px) {
          .rep-topbar { display: none !important; }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />}

        {/* Sidebar */}
        <div className={`rep-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width: '240px', background: '#0F4C81', color: 'white', padding: '24px 16px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>FPI</div>
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Finance Process</span>
          </div>
          <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '32px', marginLeft: '46px' }}>Intelligence Platform</p>
          {['Dashboard', 'My Assessments', 'Process Explorer', 'Reports', 'Settings', 'Sign Out'].map(item => (
            <div key={item} onClick={async () => {
              setSidebarOpen(false)
              if (item === 'Dashboard') router.push('/dashboard')
              if (item === 'My Assessments') router.push('/my-assessments')
              if (item === 'Process Explorer') router.push('/process-explorer')
              if (item === 'Reports') router.push('/reports')
              if (item === 'Settings') router.push('/settings')
              if (item === 'Sign Out') { await supabase.auth.signOut(); router.push('/') }
            }} style={{ padding: '10px 12px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', background: item === 'Reports' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
              {item}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="rep-main" style={{ flex: 1, background: '#f4f6f9', padding: '32px', overflowY: 'auto' }}>
          {/* Mobile topbar */}
          <div className="rep-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: '#0F4C81', padding: '12px 16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', background: '#4fa3e0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'white' }}>FPI</div>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Reports</span>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>☰</button>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>Reports</h1>
            <p style={{ color: '#666', marginTop: '4px' }}>Your Finance Process Maturity Assessment Reports</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>⏳ Loading your reports...</div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>No reports yet</div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Complete an assessment to generate your first maturity report</div>
              <button onClick={() => router.push('/process-explorer')} style={{ padding: '12px 24px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Start Assessment →
              </button>
            </div>
          ) : (
            <>
              <div className="rep-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Assessments Completed', value: reports.filter(r => r.status === 'completed').length.toString(), color: '#1d9e75' },
                  { label: 'Processes Assessed', value: reports.length.toString(), color: '#0F4C81' },
                  { label: 'Overall Maturity Score', value: overallAvg > 0 ? overallAvg.toString() : 'N/A', color: getLevelColor(getLevel(overallAvg)) },
                ].map(s => (
                  <div key={s.label} style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: s.color }}>{s.value}</p>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>Assessment Reports</h2>
              {reports.map((report, i) => {
                const config = processConfig[report.processName]
                return (
                  <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px', borderLeft: `4px solid ${config?.color || '#0F4C81'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: config?.color || '#0F4C81', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Finance Process Maturity Assessment</div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>{report.processName} — Maturity Report</h2>
                        <p style={{ fontSize: '13px', color: '#666' }}>{orgName} · {formatDate(report.lastUpdated)} · Confidential</p>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: report.status === 'completed' ? '#f0fdf4' : '#fff7ed', color: report.status === 'completed' ? '#1d9e75' : '#f97316', whiteSpace: 'nowrap' }}>
                        {report.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                      </span>
                    </div>

                    <div className="rep-score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px', background: '#f4f6f9', borderRadius: '8px', padding: '16px' }}>
                      {[
                        { label: 'Overall Score', value: report.averageScore > 0 ? report.averageScore.toString() : '-' },
                        { label: 'Maturity Level', value: report.level },
                        { label: 'Steps Completed', value: `${report.completedSteps}/${report.totalSteps}` },
                        { label: 'Last Updated', value: formatDate(report.lastUpdated) },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.label}</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: s.label === 'Maturity Level' ? getLevelColor(report.level) : '#1a1a2e' }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Assessment Progress</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>{Math.round((report.completedSteps / report.totalSteps) * 100)}%</span>
                      </div>
                      <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                        <div style={{ width: `${(report.completedSteps / report.totalSteps) * 100}%`, background: config?.color || '#0F4C81', height: '100%', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div className="rep-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button className="rep-action-btn" onClick={() => router.push(config?.resultsPath || '/results')} style={{ padding: '10px 20px', background: config?.color || '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        View Full Report →
                      </button>
                      <button className="rep-action-btn" onClick={() => router.push(config?.assessmentPath || '/assessment')} style={{ padding: '10px 20px', background: 'white', color: config?.color || '#0F4C81', border: `1px solid ${config?.color || '#0F4C81'}`, borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        {report.status === 'in-progress' ? 'Continue Assessment' : 'Retake Assessment'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    </>
  )
}
