'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import RecommendationChat from '../../components/RecommendationChat'

const stepDefinitions = [
  { code: '1.1', name: 'Close General Ledger Data Sources' },
  { code: '1.2', name: 'Pre-Close Activities' },
  { code: '1.3', name: 'Preliminary Financial Reviews & GL Close' },
  { code: '1.4', name: 'Intercompany Accounting & Eliminations' },
  { code: '1.5', name: 'Financial Consolidation' },
  { code: '1.6', name: 'Period End Reporting' },
  { code: '1.7', name: 'Management Reporting & Commentary' },
  { code: '1.8', name: 'Technical Accounting' },
  { code: '1.9', name: 'Manage Process' },
  { code: '1.10', name: 'System Governance' },
  { code: '1.11', name: 'AI & Intelligent Automation' },
  { code: '1.12', name: 'Continuous Improvement' },
]

const benchmarkAverages: Record<string, number> = {
  '1.1': 2.6, '1.2': 2.5, '1.3': 2.7, '1.4': 2.3, '1.5': 2.8,
  '1.6': 2.9, '1.7': 2.6, '1.8': 2.4, '1.9': 2.5, '1.10': 2.6,
  '1.11': 1.8, '1.12': 2.1, 'overall': 2.5
}

const maturityColumns = [
  { key: 'Initial', label: 'INITIAL', range: '1–1.9', desc: 'Manual, reactive, no documentation', color: '#ef4444', bg: '#fef2f2' },
  { key: 'Repeatable', label: 'REPEATABLE', range: '2–2.9', desc: 'Some standardisation, roles emerging', color: '#f97316', bg: '#fff7ed' },
  { key: 'Defined', label: 'DEFINED', range: '3–3.9', desc: 'Documented, KPIs in place', color: '#eab308', bg: '#fefce8' },
  { key: 'Managed', label: 'MANAGED', range: '4–4.9', desc: 'Data-driven, cross-functional', color: '#22c55e', bg: '#f0fdf4' },
  { key: 'Optimised', label: 'OPTIMISED', range: '5.0', desc: 'Predictive, AI-assisted', color: '#3b82f6', bg: '#eff6ff' },
]

const defaultRecommendations = [
  { priority: '1', action: 'Implement Automated Reconciliation Platform', detail: 'Replace manual reconciliation processes with an automated platform to reduce errors and close cycle time.', impact: 'High', effort: 'Medium', timeline: '2 Quarters', owner: 'Controller / Head of R2R', l2: '1.1' },
  { priority: '2', action: 'Establish Formal Close Management Process', detail: 'Implement a close management platform with task tracking, escalation and calendar management.', impact: 'High', effort: 'Low', timeline: '1 Quarter', owner: 'Head of R2R', l2: '1.9' },
  { priority: '3', action: 'Strengthen Intercompany Accounting Controls', detail: 'Implement automated IC matching and a formal dispute resolution process to reduce reconciliation differences.', impact: 'High', effort: 'Medium', timeline: '2 Quarters', owner: 'Group Controller', l2: '1.4' },
  { priority: '4', action: 'Pilot AI-Assisted Journal Entry Processing', detail: 'Use AI to auto-suggest and validate routine journal entries, reducing manual effort and error rates.', impact: 'Medium', effort: 'Medium', timeline: '3 Quarters', owner: 'Head of R2R', l2: '1.11' },
  { priority: '5', action: 'Develop R2R Continuous Improvement Programme', detail: 'Establish KPI tracking and a formal improvement roadmap to drive ongoing R2R maturity gains.', impact: 'Medium', effort: 'Low', timeline: '1 Quarter', owner: 'CFO', l2: '1.12' },
]

type Recommendation = {
  priority: string
  action: string
  detail: string
  impact: string
  effort: string
  timeline: string
  owner: string
  l2: string
}

type AiInsightsData = {
  l2Narratives: Record<string, string>
  strengths: string
  strengthQuote: string
  gaps: string
  gapQuote: string
  opportunity: string
  keyFindings: { type: string; text: string }[]
  recommendations?: Recommendation[]
}

type AssessmentRow = {
  step_code: string
  l3_code: string
  score: number | null
}

type L2Result = {
  code: string
  name: string
  score: number
  level: string
  narrative: string
  l3s: { code: string; score: number; level: string }[]
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

function getScorePosition(score: number): number {
  if (score < 2) return 0
  if (score < 3) return 1
  if (score < 4) return 2
  if (score < 5) return 3
  return 4
}

function RadarChart({ results, hoveredCode, onHover }: { results: L2Result[], hoveredCode: string | null, onHover: (code: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = 150
    const total = results.length
    const angleStep = (Math.PI * 2) / total

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let level = 1; level <= 5; level++) {
      ctx.beginPath()
      for (let i = 0; i < total; i++) {
        const angle = i * angleStep - Math.PI / 2
        const r = (radius * level) / 5
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = '#e0e4ea'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#999'
      ctx.textAlign = 'center'
      ctx.fillText(`${level}`, cx + 4, cy - (radius * level) / 5 + 4)
    }

    for (let i = 0; i < total; i++) {
      const angle = i * angleStep - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
      ctx.strokeStyle = '#e0e4ea'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    ctx.beginPath()
    for (let i = 0; i < total; i++) {
      const angle = i * angleStep - Math.PI / 2
      const r = (radius * results[i].score) / 5
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(29, 158, 117, 0.2)'
    ctx.fill()
    ctx.strokeStyle = '#1d9e75'
    ctx.lineWidth = 2.5
    ctx.stroke()

    for (let i = 0; i < total; i++) {
      const angle = i * angleStep - Math.PI / 2
      const r = (radius * results[i].score) / 5
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      const isHovered = hoveredCode === results[i].code
      ctx.beginPath()
      ctx.arc(x, y, isHovered ? 8 : 5, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? '#1a5276' : '#1d9e75'
      ctx.fill()
      if (isHovered) {
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    ctx.font = '11px sans-serif'
    for (let i = 0; i < total; i++) {
      const angle = i * angleStep - Math.PI / 2
      const r = radius + 28
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      ctx.textAlign = x < cx - 10 ? 'right' : x > cx + 10 ? 'left' : 'center'
      ctx.fillStyle = hoveredCode === results[i].code ? '#1a5276' : '#333'
      ctx.font = hoveredCode === results[i].code ? 'bold 11px sans-serif' : '11px sans-serif'
      ctx.fillText(results[i].code, x, y + 4)
    }
  }, [results, hoveredCode])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = 150
    const total = results.length
    const angleStep = (Math.PI * 2) / total
    let found = null
    for (let i = 0; i < total; i++) {
      const angle = i * angleStep - Math.PI / 2
      const r = (radius * results[i].score) / 5
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
      if (dist < 12) { found = results[i].code; break }
    }
    onHover(found)
  }

  return (
    <canvas ref={canvasRef} width={420} height={380}
      style={{ display: 'block', margin: '0 auto', cursor: hoveredCode ? 'pointer' : 'default' }}
      onMouseMove={handleMouseMove} onMouseLeave={() => onHover(null)} />
  )
}
// Consultant Request Modal
function ConsultantModal({ onClose, processName, overallScore }: { onClose: () => void, processName: string, overallScore: number }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [availability, setAvailability] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!name || !email) return
    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('recommendation_chats').insert({
        user_id: user.id,
        process_name: processName,
        recommendation_action: 'Consultant Request',
        messages: [{ role: 'user', content: `Name: ${name}\nEmail: ${email}\nAvailability: ${availability}\nMessage: ${message}` }]
      })
    }
    setSubmitted(true)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: '#0F2744', color: 'white', padding: '20px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#4fa3e0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>👤 FPI Consulting</div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>Request a Consultation</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>Request Submitted!</div>
              <p style={{ fontSize: '14px', color: '#666' }}>One of our FPI consultants will be in touch within 24 hours to discuss your {processName} assessment results and how we can help you improve.</p>
              <button onClick={onClose} style={{ marginTop: '20px', padding: '10px 24px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px', lineHeight: '1.6' }}>Our FPI consultants can help you implement your improvement roadmap. Share your details and we'll be in touch within 24 hours.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>Your Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Smith" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>Email Address *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@company.com" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>Availability</label>
                  <input value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g. Weekday mornings, any time next week" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>What would you like to discuss?</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="e.g. We need help prioritising our improvement roadmap and building the business case..." style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ background: '#f4f6f9', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#666' }}>
                  📊 Your {processName} assessment (Score: {overallScore}/5.0) will be shared with the consultant to provide context.
                </div>
                <button onClick={handleSubmit} disabled={!name || !email} style={{ padding: '12px', background: !name || !email ? '#ccc' : '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: !name || !email ? 'default' : 'pointer' }}>
                  Submit Request
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default function ResultsR2RPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'spider'>('grid')
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [l2Results, setL2Results] = useState<L2Result[]>([])
  const [loading, setLoading] = useState(true)
  const [aiInsightsData, setAiInsightsData] = useState<AiInsightsData | null>(null)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [activeChatRec, setActiveChatRec] = useState<Recommendation | null>(null)
  const [showConsultantModal, setShowConsultantModal] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('process_name', 'Record to Report')

      if (error || !data) { setLoading(false); return }

      const rows = data as AssessmentRow[]

      const results: L2Result[] = stepDefinitions.map(step => {
        const stepRows = rows.filter(r => r.step_code === step.code)
        const scoredRows = stepRows.filter(r => r.score !== null)
        const l2Score = scoredRows.length > 0
          ? parseFloat((scoredRows.reduce((sum, r) => sum + (r.score || 0), 0) / scoredRows.length).toFixed(1))
          : 0

        const l3s = stepRows.map(r => ({
          code: r.l3_code,
          score: r.score || 0,
          level: getLevel(r.score || 0)
        }))

        return {
          code: step.code,
          name: step.name,
          score: l2Score,
          level: getLevel(l2Score),
          narrative: `${step.name} — Score: ${l2Score}/5.0`,
          l3s
        }
      })

      setL2Results(results)
      setLoading(false)

      const scoredResults = results.filter(r => r.score > 0)
      if (scoredResults.length > 0) {
        setGeneratingInsights(true)
        try {
          const response = await fetch('/api/generate-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ l2Results: scoredResults, processName: 'Record to Report' })
          })
          const aiData = await response.json()
          if (aiData.success) {
            setAiInsightsData(aiData.insights)
            setL2Results(prev => prev.map(r => ({
              ...r,
              narrative: aiData.insights.l2Narratives?.[r.code] || r.narrative
            })))
          }
        } catch (e) {
          console.error('Failed to generate insights', e)
        }
        setGeneratingInsights(false)
      }
    }

    fetchResults()
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading your R2R results...</div>
      </div>
    </div>
  )

  const overallScore = l2Results.filter(r => r.score > 0).length > 0
    ? parseFloat((l2Results.filter(r => r.score > 0).reduce((sum, r) => sum + r.score, 0) / l2Results.filter(r => r.score > 0).length).toFixed(1))
    : 0
  const strongest = l2Results.filter(r => r.score > 0).length > 0 ? l2Results.filter(r => r.score > 0).reduce((a, b) => a.score > b.score ? a : b) : null
  const weakest = l2Results.filter(r => r.score > 0).length > 0 ? l2Results.filter(r => r.score > 0).reduce((a, b) => a.score < b.score ? a : b) : null
  const hoveredResult = l2Results.find(r => r.code === hoveredCode)

  const benchmarks = [
    { label: 'Your overall score', score: overallScore, avg: benchmarkAverages['overall'] },
    ...l2Results.filter(r => r.score > 0).map(r => ({ label: `${r.code} ${r.name}`, score: r.score, avg: benchmarkAverages[r.code] || 2.5 }))
  ]

  const keyFindings = aiInsightsData?.keyFindings || [
    { type: 'strength', text: 'Your highest scoring R2R processes show structured approaches and defined methodologies.' },
    { type: 'gap', text: 'Lower scoring processes show informal and ad-hoc approaches that need formalisation.' },
    { type: 'opportunity', text: 'Significant opportunity to improve through automation and process governance.' },
  ]

  const recommendations = aiInsightsData?.recommendations || defaultRecommendations

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', background: '#f4f6f9' }}>
      <div style={{ background: '#0F2744', color: 'white', padding: '32px 40px' }}>
        <div style={{ fontSize: '12px', color: '#1d9e75', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Finance Process Maturity Assessment</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px' }}>Record to Report — Maturity Report</h1>
            <p style={{ color: '#a0c4e8', fontSize: '14px' }}>Finance Process Intelligence Platform · Assessment completed today · Confidential</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/results-r2r-print')} style={{ padding: '9px 16px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>⬇ Download PDF Report</button>
            <button style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>⬇ Export to Excel</button>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>← Dashboard</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginTop: '28px' }}>
          {[
            { label: 'OVERALL MATURITY SCORE', value: overallScore.toString(), sub: 'out of 5.0', highlight: '#1d9e75' },
            { label: 'STRONGEST L2 PROCESS', value: strongest?.score.toFixed(1) || '-', sub: strongest?.name || '-', highlight: '#eab308' },
            { label: 'WEAKEST L2 PROCESS', value: weakest?.score.toFixed(1) || '-', sub: weakest?.name || '-', highlight: '#ef4444' },
            { label: 'L2 PROCESSES ASSESSED', value: `${l2Results.filter(r => r.score > 0).length}`, sub: `of ${l2Results.length} completed`, highlight: '#4fa3e0' },
            { label: 'L3 ACTIVITIES COVERED', value: `${l2Results.reduce((sum, r) => sum + r.l3s.filter(l => l.score > 0).length, 0)}`, sub: 'activities assessed', highlight: '#4fa3e0' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '10px', color: '#a0c4e8', letterSpacing: '0.06em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: s.highlight, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#7db3e8', marginTop: '4px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderBottom: '1px solid #e0e4ea', padding: '0 40px', display: 'flex' }}>
        {['overview', 'l2breakdown', 'aiinsights', 'recommendations'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '14px 20px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: activeTab === tab ? '700' : '400', color: activeTab === tab ? '#0F4C81' : '#666', borderBottom: activeTab === tab ? '2px solid #0F4C81' : '2px solid transparent', cursor: 'pointer' }}>
            {tab === 'overview' ? 'Overview' : tab === 'l2breakdown' ? 'L3 Breakdown' : tab === 'aiinsights' ? 'AI Insights' : 'Recommendations'}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 40px' }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>{viewMode === 'grid' ? 'Capability Maturity Grid — Record to Report' : 'Maturity Spider Chart — Record to Report'}</h2>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Hover over each dot to see the detailed maturity narrative</p>
              </div>
              <div style={{ display: 'flex', background: '#e0e4ea', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                <button onClick={() => setViewMode('grid')} style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? '#0F4C81' : '#666' }}>📊 Maturity Grid</button>
                <button onClick={() => setViewMode('spider')} style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: viewMode === 'spider' ? 'white' : 'transparent', color: viewMode === 'spider' ? '#0F4C81' : '#666' }}>🕸 Spider Chart</button>
              </div>
            </div>

            {viewMode === 'grid' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {[{ label: 'Initial (1–1.9)', color: '#ef4444' }, { label: 'Repeatable (2–2.9)', color: '#f97316' }, { label: 'Defined (3–3.9)', color: '#eab308' }, { label: 'Managed (4–4.9)', color: '#22c55e' }, { label: 'Optimised (5.0)', color: '#3b82f6' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
                      <span style={{ fontSize: '12px', color: '#666' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(5, 1fr)', marginBottom: '4px' }}>
                  <div style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: '#666' }}>L2 PROCESS</div>
                  {maturityColumns.map(col => (
                    <div key={col.key} style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: col.color, textAlign: 'center', background: col.bg, borderRadius: '4px', margin: '0 2px' }}>
                      <div>{col.label}</div>
                      <div style={{ fontWeight: '400', color: '#999', fontSize: '10px', marginTop: '2px' }}>{col.range}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(5, 1fr)', marginBottom: '8px' }}>
                  <div style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#333' }}>Descriptor</div>
                  {maturityColumns.map(col => (
                    <div key={col.key} style={{ padding: '6px 12px', fontSize: '11px', color: '#666', textAlign: 'center' }}>{col.desc}</div>
                  ))}
                </div>
                {l2Results.map((r, idx) => (
                  <div key={r.code} style={{ display: 'grid', gridTemplateColumns: '220px repeat(5, 1fr)', background: idx % 2 === 0 ? '#fafafa' : 'white', borderRadius: '4px', marginBottom: '2px' }}>
                    <div style={{ padding: '14px 12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#1d9e75' }}>L2 {r.code}</div>
                      <div style={{ fontSize: '13px', color: '#1a1a2e', fontWeight: '500' }}>{r.name}</div>
                      <div style={{ fontSize: '11px', color: r.score > 0 ? '#999' : '#ef4444', marginTop: '2px' }}>{r.score > 0 ? `Score: ${r.score}` : 'Not assessed'}</div>
                    </div>
                    {maturityColumns.map((col, colIdx) => (
                      <div key={col.key} style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {r.score > 0 && getScorePosition(r.score) === colIdx && (
                          <div
                            onMouseEnter={e => { setHoveredCode(r.code); setTooltipPos({ x: e.clientX, y: e.clientY }) }}
                            onMouseMove={e => setTooltipPos({ x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredCode(null)}
                            style={{ width: '20px', height: '20px', borderRadius: '50%', background: getLevelColor(r.level), boxShadow: hoveredCode === r.code ? `0 0 0 4px ${getLevelColor(r.level)}44` : 'none', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                {hoveredCode && hoveredResult && (
                  <div style={{ position: 'fixed', left: tooltipPos.x + 16, top: tooltipPos.y - 10, background: '#0F2744', color: 'white', padding: '14px 16px', borderRadius: '8px', maxWidth: '320px', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: '#1d9e75', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{hoveredResult.code}</span>
                      <span style={{ fontWeight: '700', fontSize: '13px' }}>{hoveredResult.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: getLevelColor(hoveredResult.level), color: 'white' }}>{hoveredResult.level}</span>
                      <span style={{ fontSize: '13px', color: '#a0c4e8' }}>Score: {hoveredResult.score} / 5.0</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#c8dff0', lineHeight: '1.6', margin: 0 }}>
                      {generatingInsights ? 'Generating AI narrative...' : hoveredResult.narrative}
                    </p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'spider' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '24px', position: 'relative' }}>
                <RadarChart results={l2Results} hoveredCode={hoveredCode} onHover={setHoveredCode} />
                {hoveredCode && hoveredResult && (
                  <div style={{ position: 'absolute', top: '50%', right: '24px', transform: 'translateY(-50%)', background: '#0F2744', color: 'white', padding: '16px', borderRadius: '8px', width: '260px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: '#1d9e75', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{hoveredResult.code}</span>
                      <span style={{ fontWeight: '700', fontSize: '13px' }}>{hoveredResult.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: getLevelColor(hoveredResult.level), color: 'white' }}>{hoveredResult.level}</span>
                      <span style={{ fontSize: '13px', color: '#a0c4e8' }}>{hoveredResult.score} / 5.0</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#c8dff0', lineHeight: '1.6', margin: 0 }}>
                      {generatingInsights ? 'Generating AI narrative...' : hoveredResult.narrative}
                    </p>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {l2Results.map(r => (
                    <div key={r.code} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getLevelColor(r.level) }} />
                      <span style={{ fontSize: '12px', color: '#666' }}>{r.code} ({r.score})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>Key Findings</h3>
              {keyFindings.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', padding: '12px', borderRadius: '8px', background: f.type === 'strength' ? '#f0fdf4' : f.type === 'gap' ? '#fef2f2' : '#fffbeb' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{f.type === 'strength' ? '✅' : f.type === 'gap' ? '⚠️' : '💡'}</span>
                  <span style={{ fontSize: '13px', color: '#333', lineHeight: '1.6' }}>{f.text}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>Industry Benchmarking — Financial Services</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>How your R2R maturity compares to Financial Services peers</p>
              {benchmarks.map((item, i) => {
                const diff = (item.score - item.avg).toFixed(1)
                const isAbove = item.score >= item.avg
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ width: '200px', fontSize: '13px', color: '#444', flexShrink: 0 }}>{item.label}</div>
                    <div style={{ flex: 1, position: 'relative', height: '12px', background: '#f0f0f0', borderRadius: '6px' }}>
                      <div style={{ width: `${(item.score / 5) * 100}%`, background: isAbove ? '#1d9e75' : '#ef4444', height: '100%', borderRadius: '6px' }} />
                      <div style={{ position: 'absolute', left: `${(item.avg / 5) * 100}%`, top: '-6px', bottom: '-6px', width: '2px', background: '#0F2744' }} />
                      <div style={{ position: 'absolute', left: `${(item.avg / 5) * 100}%`, top: '-22px', fontSize: '10px', color: '#666', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>avg {item.avg}</div>
                    </div>
                    <div style={{ width: '30px', fontSize: '15px', fontWeight: '700', color: '#1a1a2e', textAlign: 'right' }}>{item.score}</div>
                    <div style={{ width: '130px', fontSize: '12px', fontWeight: '600', color: isAbove ? '#1d9e75' : '#ef4444' }}>
                      {isAbove ? '▲' : '▼'} {Math.abs(parseFloat(diff))} {isAbove ? 'above avg' : 'below avg'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'l2breakdown' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px' }}>L3 Breakdown by L2 Process</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {l2Results.map(r => (
                <div key={r.code} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#1d9e75', fontWeight: '700' }}>L2 {r.code}</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e' }}>{r.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: getLevelColor(r.level), color: 'white' }}>{r.level}</span>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: getLevelColor(r.level), marginTop: '4px' }}>{r.score}</div>
                    </div>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '8px', marginBottom: '16px' }}>
                    <div style={{ width: `${(r.score / 5) * 100}%`, background: getLevelColor(r.level), height: '100%', borderRadius: '4px' }} />
                  </div>
                  {r.l3s.filter(l => l.score > 0).map((l3, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#1d9e75', fontWeight: '600', width: '40px', flexShrink: 0 }}>{l3.code}</span>
                      <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '4px', height: '6px' }}>
                        <div style={{ width: `${(l3.score / 5) * 100}%`, background: getLevelColor(l3.level), height: '100%', borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: getLevelColor(l3.level), width: '25px', textAlign: 'right' }}>{l3.score}</span>
                    </div>
                  ))}
                  {r.l3s.filter(l => l.score > 0).length === 0 && (
                    <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>No responses recorded yet</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'aiinsights' && (
          <div>
            <div style={{ background: '#0F2744', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#1d9e75', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🤖</div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>AI-Powered Maturity Insights — Record to Report</div>
                <div style={{ fontSize: '13px', color: '#7db3e8' }}>
                  {generatingInsights ? '⏳ Generating AI insights based on your responses...' : 'Generated by FPI Intelligence based on your responses · Assessment completed today'}
                </div>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '22px' }}>💪</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>What Your Organisation Does Well</span>
              </div>
              <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.8', marginBottom: '16px' }}>
                {generatingInsights ? 'Analysing your responses...' : aiInsightsData?.strengths || 'Complete your assessment to generate AI insights.'}
              </p>
              {aiInsightsData?.strengthQuote && (
                <div style={{ borderLeft: '3px solid #1d9e75', background: '#f0fdf4', padding: '14px 16px', borderRadius: '0 8px 8px 0' }}>
                  <p style={{ fontSize: '13px', color: '#15803d', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>"{aiInsightsData.strengthQuote}"</p>
                </div>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '22px' }}>⚠️</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>Where the Gaps Are</span>
              </div>
              <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.8', marginBottom: '16px' }}>
                {generatingInsights ? 'Analysing your responses...' : aiInsightsData?.gaps || 'Complete your assessment to generate AI insights.'}
              </p>
              {aiInsightsData?.gapQuote && (
                <div style={{ borderLeft: '3px solid #ef4444', background: '#fef2f2', padding: '14px 16px', borderRadius: '0 8px 8px 0' }}>
                  <p style={{ fontSize: '13px', color: '#dc2626', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>"{aiInsightsData.gapQuote}"</p>
                </div>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '22px' }}>💡</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>The Opportunity Ahead</span>
              </div>
              <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.8' }}>
                {generatingInsights ? 'Analysing your responses...' : aiInsightsData?.opportunity || 'Complete your assessment to generate AI insights.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>Prioritised Improvement Recommendations</h3>
              <p style={{ fontSize: '13px', color: '#666' }}>
                {generatingInsights ? '⏳ Generating AI recommendations...' : 'Ranked by impact and effort — focus on high impact, low effort actions first'}
              </p>
            </div>
            {/* Consultation Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1a5c45 100%)', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>👤 Want expert guidance?</div>
                <div style={{ fontSize: '13px', color: '#a0c4e8' }}>Our FPI consultants can help you implement your R2R improvement roadmap.</div>
              </div>
              <button onClick={() => setShowConsultantModal(true)} style={{ padding: '10px 20px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, marginLeft: '16px' }}>
                Request a Consultation
              </button>
            </div>

            {recommendations.map((r, i) => (
          
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px', borderLeft: `4px solid ${r.impact === 'High' && r.effort === 'Low' ? '#1d9e75' : r.impact === 'High' ? '#f97316' : '#eab308'}` }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f4f6f9', border: '2px solid #e0e4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px', color: '#0F4C81', flexShrink: 0 }}>{r.priority}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>{r.action}</div>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.7', marginBottom: '12px' }}>{r.detail}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: '#e8f4fd', color: '#0F4C81' }}>L2 {r.l2}</span>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: '#fef2f2', color: '#ef4444' }}>{r.impact} Priority</span>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: r.effort === 'Low' ? '#f0fdf4' : r.effort === 'Medium' ? '#fefce8' : '#fef2f2', color: r.effort === 'Low' ? '#22c55e' : r.effort === 'Medium' ? '#eab308' : '#ef4444' }}>{r.effort} Effort</span>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: '#f4f6f9', color: '#666' }}>Owner: {r.owner}</span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button onClick={() => setActiveChatRec(r)} style={{ padding: '7px 14px', background: '#f4f6f9', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        💬 Discuss with AI
                      </button>
                      <button onClick={() => setShowConsultantModal(true)} style={{ padding: '7px 14px', background: '#f4f6f9', color: '#1d9e75', border: '1px solid #1d9e75', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        👤 Talk to a Consultant
                      </button>
                    </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>IMPACT</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: r.impact === 'High' ? '#ef4444' : '#eab308', marginBottom: '8px' }}>{r.impact}</div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>EFFORT</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: r.effort === 'Low' ? '#22c55e' : r.effort === 'Medium' ? '#eab308' : '#ef4444', marginBottom: '8px' }}>{r.effort}</div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TIMELINE</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F4C81' }}>{r.timeline}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {activeChatRec && (
        <RecommendationChat
          recommendation={activeChatRec}
          processName="Record to Report"
          score={overallScore}
          onClose={() => setActiveChatRec(null)}
        />
      )}

      {showConsultantModal && (
        <ConsultantModal
          onClose={() => setShowConsultantModal(false)}
          processName="Record to Report"
          overallScore={overallScore}
        />
      )}
    </div>
  )
}