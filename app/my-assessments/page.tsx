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
const [p2pResponses, setP2pResponses] = useState<Record<string, any>>({})
const [p2pEffort, setP2pEffort] = useState<Record<string, any>>({})

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

// Fetch full P2P responses
const { data: responseData } = await supabase
  .from('assessments')
  .select('l3_code, selected_options, pain_point, score, tool_options, tool_names, other_text')
  .eq('user_id', user.id)
  .eq('process_name', 'Plan to Perform')

const responseMap: Record<string, any> = {}
if (responseData) {
  responseData.forEach(r => { responseMap[r.l3_code] = r })
}
setP2pResponses(responseMap)

// Fetch P2P effort data
const { data: p2pEffortData } = await supabase
  .from('process_effort')
  .select('step_code, headcount, roles, hours_per_cycle, hourly_rate, saving_percent, comments')
  .eq('user_id', user.id)
  .eq('process_name', 'Plan to Perform')

const p2pEffortMap: Record<string, any> = {}
if (p2pEffortData) {
  p2pEffortData.forEach(r => { p2pEffortMap[r.step_code] = r })
}
setP2pEffort(p2pEffortMap)

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
const p2pSteps = [
    { code: '1.1', name: 'Develop Top-down Plan', toolQuestion: 'How are strategic planning and target-setting managed in your organisation?', toolOptions: ['Mostly in Excel or offline', 'Mostly in a dedicated system or platform', 'A mix of Excel and platform tools', 'Not formally structured'], l3s: [
      { code: '1.1.1', name: 'Perform Strategic Analysis', options: ['Internal workshops', 'Market research & analyst insights', 'External consultants', 'Formal structured methodology (PESTLE/SWOT)', 'Not formally done'] },
      { code: '1.1.2', name: 'Articulate Stakeholder Expectations', options: ['Leadership alignment sessions', 'Formal strategy committee', 'Surveys and structured interviews', 'Ad-hoc conversations', 'Not systematic'] },
      { code: '1.1.3', name: 'Develop Strategic Objectives & KPIs', options: ['Finance-led with Balanced Scorecard', 'Strategy team owned', 'Decentralised by BU', 'Informally agreed', 'Not well defined'] },
      { code: '1.1.4', name: 'Develop What-If Scenarios', options: ['Structured scenarios with defined assumptions', 'Ad-hoc sensitivity analysis in Excel', 'Limited to best/worst case only', 'AI/ML driven scenario modelling', 'Not performed'] },
      { code: '1.1.5', name: 'Derive Top-down Targets', options: ['Board/Exec set targets centrally', 'Finance models drive the targets', 'Negotiated with BUs', 'Market benchmarks used', 'No formal top-down process'] },
      { code: '1.1.6', name: 'Run Simulations & Finalise Plan', options: ['Automated via planning platform', 'Manual Excel-based iterations', 'Finance team runs centrally', 'BU-driven with Finance review', 'No formal simulation process'] },
    ]},
    { code: '1.2', name: 'Cascade the Plan', toolQuestion: 'How is plan cascading and divisional planning managed?', toolOptions: ['EPM/Planning platform', 'Excel-based', 'Mix of systems', 'Manual/offline process'], l3s: [
      { code: '1.2.1', name: 'Translate Top-down Plan to Divisional Plan', options: ['Automated allocation via EPM tool', 'Finance manually distributes targets', 'BUs self-allocate with guidelines', 'Negotiated process', 'No formal translation'] },
      { code: '1.2.2', name: 'Define Planning Drivers and Assumptions', options: ['Centralised assumption library', 'Finance sets key drivers', 'Each BU sets their own', 'Mix of central and local', 'No formal process'] },
      { code: '1.2.3', name: 'Establish Accountability & Review Mechanisms', options: ['Formal ownership framework with sign-off', 'Manager-level ownership', 'Finance owns accountability', 'Informal agreements', 'Not established'] },
      { code: '1.2.4', name: 'Communicate Strategic Targets & Guidelines', options: ['Formal planning pack distributed', 'Finance roadshows and workshops', 'Email/SharePoint communication', 'Verbal briefings only', 'Not formally communicated'] },
      { code: '1.2.5', name: 'Monitor Initial Plan Submissions & Feedback', options: ['Automated tracking via EPM', 'Finance manually tracks submissions', 'Structured review meetings', 'Ad-hoc follow-up', 'No formal monitoring'] },
    ]},
    { code: '1.3', name: 'Develop Bottom-up Budget', toolQuestion: 'What tools support your bottom-up budgeting process?', toolOptions: ['EPM/Budgeting platform', 'Excel-based', 'ERP-integrated', 'Mix of tools'], l3s: [
      { code: '1.3.1', name: 'Develop Revenue Plan', options: ['Driver-based modelling', 'Sales team bottom-up input', 'Market share analysis', 'Historical trend extrapolation', 'Finance-led estimate'] },
      { code: '1.3.2', name: 'Develop Direct Cost Plan', options: ['Activity-based costing', 'Linked to revenue drivers', 'Historical run-rate + adjustments', 'BU-led with Finance review', 'No formal methodology'] },
      { code: '1.3.3', name: 'Develop Workforce Plan', options: ['Integrated with HR systems', 'Finance and HR co-own', 'FTE-based modelling', 'Cost rate x headcount', 'Not formally planned'] },
      { code: '1.3.4', name: 'Develop Capex and Project Plan', options: ['Project-by-project business cases', 'Portfolio-level planning', 'Finance-led allocation', 'BU-submitted with Finance approval', 'No formal Capex planning'] },
      { code: '1.3.5', name: 'Develop Operating Expense (Opex) Plan', options: ['Zero-based budgeting', 'Incremental from prior year', 'Driver-based', 'BU-owned with guidelines', 'No formal methodology'] },
      { code: '1.3.6', name: 'Consolidate Bottom-up Budget', options: ['Automated via EPM tool', 'Finance manually consolidates', 'Phased review and challenge', 'Simple aggregation', 'No formal consolidation'] },
      { code: '1.3.7', name: 'Perform Gap Analysis vs Top-down Targets', options: ['Structured gap analysis and challenge', 'Finance-led negotiation', 'BU resubmission process', 'Senior management arbitration', 'Gaps are accepted without resolution'] },
      { code: '1.3.8', name: 'Final Budget Review and Sign-off', options: ['Board/Exec formal sign-off', 'CFO approval process', 'Finance committee review', 'Informal management approval', 'No formal sign-off'] },
    ]},
    { code: '1.4', name: 'Refresh Rolling Forecasts', toolQuestion: 'What tools support your rolling forecast process?', toolOptions: ['EPM/Forecasting platform', 'Excel-based', 'BI tool integrated', 'Mix of tools'], l3s: [
      { code: '1.4.1', name: 'Seed Forecast', options: ['Automated from actuals', 'Prior forecast adjusted', 'Manual data entry', 'Driver-based seeding', 'No formal seeding'] },
      { code: '1.4.2', name: 'Refresh Revenue Forecast', options: ['Sales pipeline driven', 'Driver-based model', 'Management judgement', 'Historical trend', 'Minimal refresh done'] },
      { code: '1.4.3', name: 'Refresh Direct Cost', options: ['Linked to revenue forecast', 'Activity-based refresh', 'Manual BU input', 'Run-rate adjustment', 'Rarely refreshed'] },
      { code: '1.4.4', name: 'Refresh Workforce Forecast', options: ['HR system integrated', 'Finance and HR joint update', 'Headcount tracker', 'Manual update', 'Not regularly refreshed'] },
      { code: '1.4.5', name: 'Refresh Project & Capex', options: ['Project management system linked', 'PMO provides updates', 'Finance manually tracks', 'Quarterly review only', 'Rarely updated'] },
      { code: '1.4.6', name: 'Refresh Opex Forecast', options: ['Run-rate + known changes', 'BU-led refresh', 'Finance-driven', 'Annual only', 'Not formally refreshed'] },
      { code: '1.4.7', name: 'Consolidate Forecasts Across Functions', options: ['Automated via EPM', 'Finance manually aggregates', 'Phased submission process', 'Single owner consolidates', 'No formal consolidation'] },
      { code: '1.4.8', name: 'Perform Scenario Testing', options: ['Automated scenario modelling', 'Manual what-if in Excel', 'Predefined scenario templates', 'Senior management driven', 'Not performed'] },
    ]},
    { code: '1.5', name: 'Report Results', toolQuestion: 'What tools support your performance reporting?', toolOptions: ['BI/Analytics platform (Power BI, Tableau etc.)', 'EPM reporting module', 'Excel-based', 'ERP standard reports'], l3s: [
      { code: '1.5.1', name: 'Process Management Allocations', options: ['Automated allocation rules in the system', 'Finance manually applies allocations each period', 'Shared service centre driven allocations', 'Driver-based allocation methodology', 'Allocations not formally managed'] },
      { code: '1.5.2', name: 'Run Variance Analytics', options: ['Automated variance reporting', 'Finance-led manual analysis', 'BU-led self-service', 'Exception-based reporting', 'Minimal variance analysis'] },
      { code: '1.5.3', name: 'Define Reporting Frequency', options: ['Board/Exec driven cadence', 'Monthly standard pack', 'Weekly operational reports', 'On-demand self-service', 'No defined cadence'] },
      { code: '1.5.4', name: 'Standardise Management Reporting', options: ['Single standard report pack', 'Mostly standardised with some variation', 'BU-specific reports', 'Highly customised per stakeholder', 'No standardisation'] },
    ]},
    { code: '1.6', name: 'Take Corrective Actions', toolQuestion: 'What tools support your corrective action tracking?', toolOptions: ['Integrated performance management tool', 'Project management tool', 'Excel tracker', 'No formal tool'], l3s: [
      { code: '1.6.1', name: 'Identify Root Causes for Performance Gaps', options: ['Structured root cause analysis', 'Finance-led investigation', 'BU self-assessment', 'Management judgement', 'Not formally identified'] },
      { code: '1.6.2', name: 'Define and Document Corrective Action Plans', options: ['Formal action log with owners', 'Finance tracks actions', 'BU-owned action plans', 'Verbal commitments only', 'Not formally documented'] },
      { code: '1.6.3', name: 'Assign Actions to Owners & Deadlines', options: ['Formal ownership framework', 'CFO/Finance assigns', 'Management self-assign', 'Informal agreements', 'No formal assignment'] },
      { code: '1.6.4', name: 'Track and Monitor Corrective Action Progress', options: ['Automated tracking system', 'Finance reviews monthly', 'Action log reviewed in meetings', 'Ad-hoc follow-up', 'Not tracked'] },
      { code: '1.6.5', name: 'Reforecast Based on Corrective Measures', options: ['Immediate forecast update', 'Next cycle refresh', 'Management overlay applied', 'Rarely reflected', 'Not incorporated'] },
      { code: '1.6.6', name: 'Evaluate Effectiveness & Close Loop', options: ['Formal post-action review', 'Variance tracking over time', 'Management sign-off', 'Informal assessment', 'Not evaluated'] },
    ]},
    { code: '1.7', name: 'Govern the Process', toolQuestion: 'What governance tools and frameworks support your FP&A process?', toolOptions: ['Integrated GRC platform', 'EPM governance module', 'SharePoint/intranet', 'Manual/Excel-based'], l3s: [
      { code: '1.7.1', name: 'Manage FP&A Planning & Reporting Calendar', options: ['Centralised calendar with automated reminders', 'Finance owns and distributes', 'Shared across Finance and BUs', 'Informal timing', 'No formal calendar'] },
      { code: '1.7.2', name: 'Manage Policies, Standards & Templates', options: ['Central repository with version control', 'Finance maintains and distributes', 'SharePoint/intranet based', 'Ad-hoc per cycle', 'No formal management'] },
      { code: '1.7.3', name: 'Manage Data & Master Data', options: ['Centralised MDM solution', 'Finance owns master data', 'IT manages with Finance input', 'Multiple sources managed separately', 'No formal MDM'] },
      { code: '1.7.4', name: 'Manage Planning & Reporting Systems (EPM)', options: ['Dedicated EPM platform centrally managed', 'Finance owns system configuration', 'IT managed with Finance input', 'Excel-based with some tools', 'No formal system management'] },
      { code: '1.7.5', name: 'Manage Internal Controls', options: ['Formal control framework', 'Audit-driven controls', 'Finance self-assurance', 'Informal checks', 'No formal controls'] },
      { code: '1.7.6', name: 'Process Automation & Digital Tools', options: ['Fully automated end-to-end', 'Partially automated key tasks', 'RPA/macros for repetitive tasks', 'Manual with some tools', 'Largely manual'] },
      { code: '1.7.7', name: 'Govern AI', options: ['Formal AI governance framework', 'AI use cases piloted with oversight', 'Exploring AI opportunities', 'Limited AI awareness', 'No AI governance'] },
      { code: '1.7.8', name: 'Ensure FP&A Team Capability Development', options: ['Structured L&D programme', 'On-the-job learning', 'External training/qualifications', 'Ad-hoc training', 'No formal development'] },
      { code: '1.7.9', name: 'Archive & Maintain Records', options: ['Automated archiving system', 'SharePoint/document management', 'Finance manually archives', 'Email-based', 'No formal archiving'] },
    ]},
  ]

  const handleDownloadTemplate = () => {
    const rows: string[][] = [['Step Code', 'Step Name', 'L3 Code', 'L3 Name', 'Available Options', 'Selected Options (semicolon separated)', 'Pain Point', 'Score (1-5)', 'Type']]
    for (const s of p2pSteps) {
      for (const l3 of s.l3s) {
        const r = p2pResponses[l3.code] || {}
        const selected = (r.selected_options || []).join('; ')
        const painPoint = r.pain_point || ''
        const score = r.score != null ? String(r.score) : ''
        rows.push([s.code, s.name, l3.code, l3.name, l3.options.join('; '), selected, painPoint, score, 'L3'])
      }
      const firstL3Code = s.l3s[0]?.code
      const firstL3R = firstL3Code ? (p2pResponses[firstL3Code] || {}) : {}
      const toolSelected = (firstL3R.tool_options || []).join('; ')
      rows.push([s.code, s.name, 'TOOL', 'Tool Usage', s.toolOptions.join('; '), toolSelected, '', '', 'TOOL'])
      const eff = p2pEffort[s.code] || {}
      const effortVal = [
        eff.headcount || '',
        eff.hours_per_cycle || '',
        (eff.roles || ''),
        eff.comments || ''
      ].join(' | ')
      const effortRoles = 'CFO / Finance Director; Financial Controller; FP&A Manager / Analyst; Management Accountant; Financial Accountant; Accounts Payable / Receivable; Treasury Analyst; Tax Manager; Business Partner; Operations Manager; Department Budget Holder; ERP/Systems Administrator; IT Manager; Data Analyst / BI Developer; External Auditor; Outsourced Provider'
rows.push([s.code, s.name, 'EFFORT', 'Team & Effort', `Headcount | Hours per cycle | Roles (from: ${effortRoles}) | Comments`, effortVal, '', '', 'EFFORT'])
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plan-to-perform-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>, processName: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const rows = lines.slice(1).map(line => {
      const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || []
      return cols
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    
    for (const row of rows) {
      const [stepCode, , l3Code, , availableRaw, selectedRaw, painPoint, scoreRaw, type] = row
const rowType = type || painPoint // TOOL/EFFORT rows only have 7 cols, type lands at index 6
      if (!l3Code || l3Code === 'L3 Code') continue

      if (rowType === 'TOOL') {
        const toolOptions = selectedRaw ? selectedRaw.split(';').map(s => s.trim()).filter(Boolean) : []
        await supabase.from('assessments').upsert({
          user_id: user.id,
          process_name: processName,
          step_code: stepCode,
          l3_code: 'TOOL_' + stepCode,
          selected_options: [],
          pain_point: '',
          score: null,
          other_text: '',
          tool_options: toolOptions,
          tool_names: ''
        }, { onConflict: 'user_id,l3_code' })
      } else if (rowType === 'EFFORT') {
        const effortParts = (selectedRaw || '').split('|').map(s => s.trim())
        const headcount = parseInt(effortParts[0]) || 0
        const hoursPerCycle = parseInt(effortParts[1]) || 0
        const roles = effortParts[2] ? effortParts[2].split(';').map(r => r.trim()).filter(Boolean) : []
        const comments = effortParts[3] || ''
        await supabase.from('process_effort').upsert({
          user_id: user.id,
          process_name: processName,
          step_code: stepCode,
          step_name: row[1],
          headcount,
          hours_per_cycle: hoursPerCycle,
          roles,
          comments
        }, { onConflict: 'user_id,process_name,step_code' })
      } else {
        const selected = selectedRaw ? selectedRaw.split(';').map(s => s.trim()).filter(Boolean) : []
        const score = parseFloat(scoreRaw) || null
        await supabase.from('assessments').upsert({
          user_id: user.id,
          process_name: processName,
          step_code: stepCode,
          l3_code: l3Code,
          selected_options: selected,
          pain_point: painPoint || '',
          score: score,
          other_text: '',
          tool_options: [],
          tool_names: ''
        }, { onConflict: 'user_id,l3_code' })
      }
    }

    alert('Import complete! Go to the assessment to review your responses.')
    window.location.reload()
  }
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
                        {p.processName === 'Plan to Perform' && (
                          <>
                            <button onClick={() => handleDownloadTemplate()} style={{ padding: '10px 20px', background: 'white', color: '#1d9e75', border: '1px solid #1d9e75', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>⬇ Template</button>
                            <label style={{ padding: '10px 20px', background: 'white', color: '#1d9e75', border: '1px solid #1d9e75', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                              ⬆ Import
                              <input type="file" accept=".csv" onChange={e => handleImportCSV(e, p.processName)} style={{ display: 'none' }} />
                            </label>
                          </>
                        )}
                        <button onClick={() => router.push(p.processName === 'Record to Report' ? '/assessment-r2r' : '/assessment')} style={{ padding: '10px 20px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          {p.status === 'not-started' ? 'Start →' : p.status === 'in-progress' ? 'Continue →' : 'Continue →'}
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