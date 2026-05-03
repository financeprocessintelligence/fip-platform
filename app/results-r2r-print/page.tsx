'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const stepDefinitions = [
  { code: '1.1', name: 'Close General Ledger Data Sources' },
  { code: '1.2', name: 'Perform Reconciliations' },
  { code: '1.3', name: 'Process Adjusting Entries' },
  { code: '1.4', name: 'Consolidate Financial Data' },
  { code: '1.5', name: 'Produce Financial Statements' },
  { code: '1.6', name: 'Manage Reporting & Analysis' },
  { code: '1.7', name: 'Manage Statutory & Tax Reporting' },
  { code: '1.8', name: 'Manage Intercompany' },
  { code: '1.9', name: 'Manage Process' },
  { code: '1.10', name: 'System Governance' },
  { code: '1.11', name: 'AI & Intelligent Automation' },
  { code: '1.12', name: 'Continuous Improvement' },
]

const maturityColumns = [
  { key: 'Initial', range: '1–1.9', color: '#ef4444' },
  { key: 'Repeatable', range: '2–2.9', color: '#f97316' },
  { key: 'Defined', range: '3–3.9', color: '#eab308' },
  { key: 'Managed', range: '4–4.9', color: '#22c55e' },
  { key: 'Optimised', range: '5.0', color: '#3b82f6' },
]

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

type AssessmentRow = { id: string; user_id: string; process_name: string; step_code: string; l3_code: string; score: number | null; responses: any; updated_at: string }
type L2Result = { code: string; name: string; score: number; level: string; l3s: { code: string; score: number; level: string }[] }

export default function ResultsR2RPrintPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<L2Result[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [userName, setUserName] = useState('')
  const [orgName, setOrgName] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      setUserName(user.user_metadata?.full_name || '')
      setOrgName(user.user_metadata?.org_name || '')

      const { data, error } = await supabase.from('assessments').select('*').eq('user_id', user.id).eq('process_name', 'Record to Report')
      if (error || !data) { setLoading(false); return }

      const rows = data as AssessmentRow[]
      const l2Results: L2Result[] = stepDefinitions.map(step => {
        const stepRows = rows.filter(r => r.step_code === step.code)
        const scoredRows = stepRows.filter(r => r.score !== null)
        const l2Score = scoredRows.length > 0 ? parseFloat((scoredRows.reduce((sum, r) => sum + (r.score || 0), 0) / scoredRows.length).toFixed(1)) : 0
        const l3s = stepRows.map(r => ({ code: r.l3_code, score: r.score || 0, level: getLevel(r.score || 0) }))
        return { code: step.code, name: step.name, score: l2Score, level: getLevel(l2Score), l3s }
      })

      setResults(l2Results)
      const scored = l2Results.filter(r => r.score > 0)
      const overall = scored.length > 0 ? parseFloat((scored.reduce((sum, r) => sum + r.score, 0) / scored.length).toFixed(1)) : 0
      setOverallScore(overall)
      setLoading(false)

      if (scored.length > 0) {
        setGeneratingInsights(true)
        try {
          const res = await fetch('/api/generate-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ l2Results: scored, processName: 'Record to Report' })
          })
          const aiData = await res.json()
          if (aiData.success) setAiInsights(aiData.insights)
        } catch (e) {}
        setGeneratingInsights(false)
      }
    }
    fetchResults()
  }, [router])

  const handleDownloadPDF = async () => {
    if (generatingInsights) {
      alert('Please wait for AI insights to finish loading before downloading.')
      return
    }
    const element = document.getElementById('print-content')
    if (!element) return
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      height: element.scrollHeight,
      windowHeight: element.scrollHeight
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const totalHeight = (canvas.height * pdfWidth) / canvas.width
    const totalPages = Math.ceil(totalHeight / pdfHeight)
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, -(page * pdfHeight), pdfWidth, totalHeight)
    }
    pdf.save('record-to-report-report.pdf')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Preparing your report...</div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
      {/* Toolbar */}
      <div style={{ background: '#0F2744', color: 'white', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '16px', fontWeight: '700' }}>Record to Report — Full Report</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownloadPDF} style={{ padding: '9px 16px', background: generatingInsights ? '#999' : '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{generatingInsights ? '⏳ Generating insights...' : '⬇ Download PDF'}</button>
          <button onClick={() => router.push('/results-r2r')} style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>← Back to Results</button>
        </div>
      </div>

      <div id="print-content" style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: '#0F2744', color: 'white', borderRadius: '12px', padding: '32px', marginBottom: '60px' }}>
          <div style={{ fontSize: '12px', color: '#4fa3e0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Finance Process Maturity Assessment</div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>Record to Report — Maturity Report</h1>
          <p style={{ color: '#a0c4e8', fontSize: '14px' }}>{orgName || 'Your Organisation'} · {userName || ''} · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Overall Score */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '60px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Overall Maturity Score</div>
          <div style={{ fontSize: '56px', fontWeight: 'bold', color: getLevelColor(getLevel(overallScore)) }}>{overallScore}</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: getLevelColor(getLevel(overallScore)) }}>{getLevel(overallScore)}</div>
        </div>

        {/* Bar Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '60px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>L2 Process Scores</h2>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{ width: '220px', fontSize: '13px', color: '#444' }}>{r.code} {r.name}</div>
              <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '4px', height: '12px' }}>
                <div style={{ width: `${(r.score / 5) * 100}%`, background: getLevelColor(r.level), height: '100%', borderRadius: '4px' }} />
              </div>
              <div style={{ width: '40px', fontSize: '14px', fontWeight: '700', color: getLevelColor(r.level) }}>{r.score}</div>
              <div style={{ width: '80px', fontSize: '11px', color: getLevelColor(r.level), fontWeight: '600' }}>{r.level}</div>
            </div>
          ))}
        </div>

        {/* Maturity Grid */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '60px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>Maturity Grid</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left', background: '#f4f6f9' }}>Process</th>
                {maturityColumns.map(col => (
                  <th key={col.key} style={{ padding: '8px', textAlign: 'center', background: col.color, color: 'white', fontSize: '11px' }}>{col.key}<br/>{col.range}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontSize: '12px', color: '#444' }}>{r.code} {r.name}</td>
                  {maturityColumns.map(col => (
                    <td key={col.key} style={{ padding: '8px', textAlign: 'center', background: r.level === col.key ? col.color : 'transparent' }}>
                      {r.level === col.key && <span style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>●</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* L3 Breakdown */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '60px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>L3 Activity Breakdown</h2>
          {results.map((r, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F4C81', marginBottom: '8px', padding: '6px 10px', background: '#f4f6f9', borderRadius: '6px' }}>{r.code} {r.name} — <span style={{ color: getLevelColor(r.level) }}>{r.score} {r.level}</span></div>
              {r.l3s.map((l3, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', paddingLeft: '16px' }}>
                  <div style={{ width: '60px', fontSize: '12px', color: '#666' }}>{l3.code}</div>
                  <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                    <div style={{ width: `${(l3.score / 5) * 100}%`, background: getLevelColor(l3.level), height: '100%', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '30px', fontSize: '13px', fontWeight: '700', color: getLevelColor(l3.level) }}>{l3.score}</div>
                  <div style={{ width: '70px', fontSize: '11px', color: getLevelColor(l3.level) }}>{l3.level}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* AI Insights */}
        {generatingInsights && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '60px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', color: '#666' }}>
            ⏳ Generating AI insights...
          </div>
        )}
        {aiInsights && (
          <>
            {(aiInsights.keyFindings || aiInsights.strengths) && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '60px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '12px' }}>AI Insights</h2>
                {aiInsights.keyFindings && <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.7', marginBottom: '12px' }}><strong>Key Findings:</strong> {typeof aiInsights.keyFindings === 'string' ? aiInsights.keyFindings : aiInsights.keyFindings?.text || ''}</p>}
                {aiInsights.strengths && <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.7', marginBottom: '12px' }}><strong>Strengths:</strong> {typeof aiInsights.strengths === 'string' ? aiInsights.strengths : aiInsights.strengths?.text || ''}</p>}
                {aiInsights.gaps && <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.7', marginBottom: '12px' }}><strong>Gaps:</strong> {typeof aiInsights.gaps === 'string' ? aiInsights.gaps : aiInsights.gaps?.text || ''}</p>}
                {aiInsights.opportunity && <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.7' }}><strong>Opportunity:</strong> {typeof aiInsights.opportunity === 'string' ? aiInsights.opportunity : aiInsights.opportunity?.text || ''}</p>}
              </div>
            )}
            {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '60px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' }}>Recommendations</h2>
                {aiInsights.recommendations.map((rec: any, i: number) => (
                  <div key={i} style={{ marginBottom: '16px', padding: '16px', background: '#f4f6f9', borderRadius: '8px', borderLeft: '4px solid #0F4C81' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F4C81', marginBottom: '6px' }}>{i + 1}. {rec.title || rec.action || rec.priority || ''}</div>
                    {rec.detail && <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{rec.detail}</p>}
                    {rec.impact && <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>Impact: {rec.impact} · Effort: {rec.effort || ''} · Timeline: {rec.timeline || ''}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}