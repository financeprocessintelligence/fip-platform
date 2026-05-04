'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
const steps = [
  {
    code: '1.1',
    name: 'Develop Top-down Plan',
    description: 'Define your strategy, planning logic, and target-setting methodology.',
    l3s: [
      { code: '1.1.1', name: 'Perform Strategic Analysis', question: 'How is strategic analysis conducted before planning starts?', options: ['Internal workshops', 'Market research & analyst insights', 'External consultants', 'Formal structured methodology (PESTLE/SWOT)', 'Not formally done'], painPoint: 'What limits your ability to perform deep strategic analysis?' },
      { code: '1.1.2', name: 'Articulate Stakeholder Expectations', question: 'How are stakeholder expectations gathered and aligned?', options: ['Leadership alignment sessions', 'Formal strategy committee', 'Surveys and structured interviews', 'Ad-hoc conversations', 'Not systematic'], painPoint: 'What causes misalignment between strategy owners and planners?' },
      { code: '1.1.3', name: 'Develop Strategic Objectives & KPIs', question: 'How are strategic objectives translated into measurable drivers?', options: ['Finance-led with Balanced Scorecard', 'Strategy team owned', 'Decentralised by BU', 'Informally agreed', 'Not well defined'], painPoint: 'Where does the link between objectives and drivers break?' },
      { code: '1.1.4', name: 'Develop What-If Scenarios', question: 'How does your organisation approach scenario planning?', options: ['Structured scenarios with defined assumptions', 'Ad-hoc sensitivity analysis in Excel', 'Limited to best/worst case only', 'AI/ML driven scenario modelling', 'Not performed'], painPoint: 'What prevents meaningful scenario analysis?' },
      { code: '1.1.5', name: 'Derive Top-down Targets', question: 'How are top-down financial targets derived and communicated?', options: ['Board/Exec set targets centrally', 'Finance models drive the targets', 'Negotiated with BUs', 'Market benchmarks used', 'No formal top-down process'], painPoint: 'What causes tension between top-down targets and BU submissions?' },
      { code: '1.1.6', name: 'Run Simulations & Finalise Plan', question: 'How are final plan simulations run and the plan locked?', options: ['Automated via planning platform', 'Manual Excel-based iterations', 'Finance team runs centrally', 'BU-driven with Finance review', 'No formal simulation process'], painPoint: 'What slows down plan finalisation?' },
    ],
    toolQuestion: 'How are strategic planning and target-setting managed in your organisation?',
    toolOptions: ['Mostly in Excel or offline', 'Mostly in a dedicated system or platform', 'A mix of Excel and platform tools', 'Not formally structured'],
  },
  {
    code: '1.2',
    name: 'Cascade the Plan',
    description: 'Translate top-down targets into divisional and team-level plans.',
    l3s: [
      { code: '1.2.1', name: 'Translate Top-down Plan to Divisional Plan', question: 'How are top-down targets translated to divisional plans?', options: ['Automated allocation via EPM tool', 'Finance manually distributes targets', 'BUs self-allocate with guidelines', 'Negotiated process', 'No formal translation'], painPoint: 'What causes delays or errors in plan translation?' },
      { code: '1.2.2', name: 'Define Planning Drivers and Assumptions', question: 'How are planning drivers and assumptions defined?', options: ['Centralised assumption library', 'Finance sets key drivers', 'Each BU sets their own', 'Mix of central and local', 'No formal process'], painPoint: 'What causes inconsistency in planning assumptions?' },
      { code: '1.2.3', name: 'Establish Accountability & Review Mechanisms', question: 'How is accountability for plan delivery established?', options: ['Formal ownership framework with sign-off', 'Manager-level ownership', 'Finance owns accountability', 'Informal agreements', 'Not established'], painPoint: 'Where does accountability break down in your planning process?' },
      { code: '1.2.4', name: 'Communicate Strategic Targets & Guidelines', question: 'How are planning guidelines communicated to the business?', options: ['Formal planning pack distributed', 'Finance roadshows and workshops', 'Email/SharePoint communication', 'Verbal briefings only', 'Not formally communicated'], painPoint: 'What causes confusion when communicating planning guidelines?' },
      { code: '1.2.5', name: 'Monitor Initial Plan Submissions & Feedback', question: 'How are initial plan submissions monitored and reviewed?', options: ['Automated tracking via EPM', 'Finance manually tracks submissions', 'Structured review meetings', 'Ad-hoc follow-up', 'No formal monitoring'], painPoint: 'What makes the submission and review process difficult?' },
    ],
    toolQuestion: 'How is plan cascading and divisional planning managed?',
    toolOptions: ['EPM/Planning platform', 'Excel-based', 'Mix of systems', 'Manual/offline process'],
  },
  {
    code: '1.3',
    name: 'Develop Bottom-up Budget',
    description: 'Build detailed revenue, cost and capital plans from business units.',
    l3s: [
      { code: '1.3.1', name: 'Develop Revenue Plan', question: 'How is the revenue plan developed?', options: ['Driver-based modelling', 'Sales team bottom-up input', 'Market share analysis', 'Historical trend extrapolation', 'Finance-led estimate'], painPoint: 'What makes revenue planning difficult or inaccurate?' },
      { code: '1.3.2', name: 'Develop Direct Cost Plan', question: 'How are direct costs planned?', options: ['Activity-based costing', 'Linked to revenue drivers', 'Historical run-rate + adjustments', 'BU-led with Finance review', 'No formal methodology'], painPoint: 'What causes direct cost planning to be unreliable?' },
      { code: '1.3.3', name: 'Develop Workforce Plan', question: 'How is the workforce plan developed?', options: ['Integrated with HR systems', 'Finance and HR co-own', 'FTE-based modelling', 'Cost rate x headcount', 'Not formally planned'], painPoint: 'What makes workforce planning challenging?' },
      { code: '1.3.4', name: 'Develop Capex and Project Plan', question: 'How is the capital expenditure plan developed?', options: ['Project-by-project business cases', 'Portfolio-level planning', 'Finance-led allocation', 'BU-submitted with Finance approval', 'No formal Capex planning'], painPoint: 'What causes Capex planning to be inconsistent?' },
      { code: '1.3.5', name: 'Develop Operating Expense (Opex) Plan', question: 'How is Opex planned?', options: ['Zero-based budgeting', 'Incremental from prior year', 'Driver-based', 'BU-owned with guidelines', 'No formal methodology'], painPoint: 'What causes Opex budgets to be inaccurate?' },
      { code: '1.3.6', name: 'Consolidate Bottom-up Budget', question: 'How is the bottom-up budget consolidated?', options: ['Automated via EPM tool', 'Finance manually consolidates', 'Phased review and challenge', 'Simple aggregation', 'No formal consolidation'], painPoint: 'What makes budget consolidation time-consuming?' },
      { code: '1.3.7', name: 'Perform Gap Analysis vs Top-down Targets', question: 'How are gaps between bottom-up and top-down addressed?', options: ['Structured gap analysis and challenge', 'Finance-led negotiation', 'BU resubmission process', 'Senior management arbitration', 'Gaps are accepted without resolution'], painPoint: 'What makes gap closure difficult?' },
      { code: '1.3.8', name: 'Final Budget Review and Sign-off', question: 'How is the final budget reviewed and approved?', options: ['Board/Exec formal sign-off', 'CFO approval process', 'Finance committee review', 'Informal management approval', 'No formal sign-off'], painPoint: 'What delays the final budget approval?' },
    ],
    toolQuestion: 'What tools support your bottom-up budgeting process?',
    toolOptions: ['EPM/Budgeting platform', 'Excel-based', 'ERP-integrated', 'Mix of tools'],
  },
  {
    code: '1.4',
    name: 'Refresh Rolling Forecasts',
    description: 'Update forecasts regularly to reflect changing business conditions.',
    l3s: [
      { code: '1.4.1', name: 'Seed Forecast', question: 'How is the forecast seeded at the start of each cycle?', options: ['Automated from actuals', 'Prior forecast adjusted', 'Manual data entry', 'Driver-based seeding', 'No formal seeding'], painPoint: 'What makes forecast seeding inefficient?' },
      { code: '1.4.2', name: 'Refresh Revenue Forecast', question: 'How is the revenue forecast refreshed?', options: ['Sales pipeline driven', 'Driver-based model', 'Management judgement', 'Historical trend', 'Minimal refresh done'], painPoint: 'What makes revenue forecasting unreliable?' },
      { code: '1.4.3', name: 'Refresh Direct Cost', question: 'How are direct costs refreshed in the forecast?', options: ['Linked to revenue forecast', 'Activity-based refresh', 'Manual BU input', 'Run-rate adjustment', 'Rarely refreshed'], painPoint: 'What causes direct cost forecasts to lag reality?' },
      { code: '1.4.4', name: 'Refresh Workforce Forecast', question: 'How is the workforce forecast updated?', options: ['HR system integrated', 'Finance and HR joint update', 'Headcount tracker', 'Manual update', 'Not regularly refreshed'], painPoint: 'What makes workforce forecasting difficult?' },
      { code: '1.4.5', name: 'Refresh Project & Capex', question: 'How is the Capex forecast refreshed?', options: ['Project management system linked', 'PMO provides updates', 'Finance manually tracks', 'Quarterly review only', 'Rarely updated'], painPoint: 'What causes Capex forecast inaccuracy?' },
      { code: '1.4.6', name: 'Refresh Opex Forecast', question: 'How is the Opex forecast updated?', options: ['Run-rate + known changes', 'BU-led refresh', 'Finance-driven', 'Annual only', 'Not formally refreshed'], painPoint: 'What causes Opex forecast to drift from actuals?' },
      { code: '1.4.7', name: 'Consolidate Forecasts Across Functions', question: 'How are forecasts consolidated across the organisation?', options: ['Automated via EPM', 'Finance manually aggregates', 'Phased submission process', 'Single owner consolidates', 'No formal consolidation'], painPoint: 'What makes forecast consolidation challenging?' },
      { code: '1.4.8', name: 'Perform Scenario Testing', question: 'How is scenario testing performed during the forecast?', options: ['Automated scenario modelling', 'Manual what-if in Excel', 'Predefined scenario templates', 'Senior management driven', 'Not performed'], painPoint: 'What limits your ability to perform meaningful scenario testing?' },
    ],
    toolQuestion: 'What tools support your rolling forecast process?',
    toolOptions: ['EPM/Forecasting platform', 'Excel-based', 'BI tool integrated', 'Mix of tools'],
  },
  {
    code: '1.5',
    name: 'Report Results',
    description: 'Deliver timely and insightful performance reporting to stakeholders.',
    l3s: [
      { code: '1.5.1', name: 'Process Management Allocations', question: 'How are management allocations applied and managed in your reporting?', options: ['Automated allocation rules in the system', 'Finance manually applies allocations each period', 'Shared service centre driven allocations', 'Driver-based allocation methodology', 'Allocations not formally managed'], painPoint: 'What causes allocation disputes or inaccuracies in your reporting?' },
      { code: '1.5.2', name: 'Run Variance Analytics', question: 'How are variances between actuals and plan analysed?', options: ['Automated variance reporting', 'Finance-led manual analysis', 'BU-led self-service', 'Exception-based reporting', 'Minimal variance analysis'], painPoint: 'What makes variance analysis time-consuming or unreliable?' },
      { code: '1.5.3', name: 'Define Reporting Frequency', question: 'How is reporting frequency determined?', options: ['Board/Exec driven cadence', 'Monthly standard pack', 'Weekly operational reports', 'On-demand self-service', 'No defined cadence'], painPoint: 'What causes reporting frequency to be misaligned with business needs?' },
      { code: '1.5.4', name: 'Standardise Management Reporting', question: 'How standardised is your management reporting?', options: ['Single standard report pack', 'Mostly standardised with some variation', 'BU-specific reports', 'Highly customised per stakeholder', 'No standardisation'], painPoint: 'What prevents full standardisation of management reporting?' },
    ],
    toolQuestion: 'What tools support your performance reporting?',
    toolOptions: ['BI/Analytics platform (Power BI, Tableau etc.)', 'EPM reporting module', 'Excel-based', 'ERP standard reports'],
  },
  {
    code: '1.6',
    name: 'Take Corrective Actions',
    description: 'Identify gaps, assign owners and track performance improvement actions.',
    l3s: [
      { code: '1.6.1', name: 'Identify Root Causes for Performance Gaps', question: 'How are root causes of performance gaps identified?', options: ['Structured root cause analysis', 'Finance-led investigation', 'BU self-assessment', 'Management judgement', 'Not formally identified'], painPoint: 'What makes root cause identification difficult?' },
      { code: '1.6.2', name: 'Define and Document Corrective Action Plans', question: 'How are corrective action plans defined and documented?', options: ['Formal action log with owners', 'Finance tracks actions', 'BU-owned action plans', 'Verbal commitments only', 'Not formally documented'], painPoint: 'What prevents effective corrective action planning?' },
      { code: '1.6.3', name: 'Assign Actions to Owners & Deadlines', question: 'How are actions assigned and deadlines set?', options: ['Formal ownership framework', 'CFO/Finance assigns', 'Management self-assign', 'Informal agreements', 'No formal assignment'], painPoint: 'What causes ownership gaps in corrective actions?' },
      { code: '1.6.4', name: 'Track and Monitor Corrective Action Progress', question: 'How is corrective action progress tracked?', options: ['Automated tracking system', 'Finance reviews monthly', 'Action log reviewed in meetings', 'Ad-hoc follow-up', 'Not tracked'], painPoint: 'What causes corrective actions to stall?' },
      { code: '1.6.5', name: 'Reforecast Based on Corrective Measures', question: 'How are corrective actions reflected in the forecast?', options: ['Immediate forecast update', 'Next cycle refresh', 'Management overlay applied', 'Rarely reflected', 'Not incorporated'], painPoint: 'What prevents corrective actions from being reflected in forecasts?' },
      { code: '1.6.6', name: 'Evaluate Effectiveness & Close Loop', question: 'How is the effectiveness of corrective actions evaluated?', options: ['Formal post-action review', 'Variance tracking over time', 'Management sign-off', 'Informal assessment', 'Not evaluated'], painPoint: 'What prevents effective evaluation of corrective actions?' },
    ],
    toolQuestion: 'What tools support your corrective action tracking?',
    toolOptions: ['Integrated performance management tool', 'Project management tool', 'Excel tracker', 'No formal tool'],
  },
  {
    code: '1.7',
    name: 'Govern the Process',
    description: 'Manage FP&A governance, controls, data quality and capability.',
    l3s: [
      { code: '1.7.1', name: 'Manage FP&A Planning & Reporting Calendar', question: 'How is the FP&A calendar managed?', options: ['Centralised calendar with automated reminders', 'Finance owns and distributes', 'Shared across Finance and BUs', 'Informal timing', 'No formal calendar'], painPoint: 'What causes the FP&A calendar to slip?' },
      { code: '1.7.2', name: 'Manage Policies, Standards & Templates', question: 'How are FP&A policies and templates managed?', options: ['Central repository with version control', 'Finance maintains and distributes', 'SharePoint/intranet based', 'Ad-hoc per cycle', 'No formal management'], painPoint: 'What causes inconsistency in policies and templates?' },
      { code: '1.7.3', name: 'Manage Data & Master Data', question: 'How is master data managed for planning purposes?', options: ['Centralised MDM solution', 'Finance owns master data', 'IT manages with Finance input', 'Multiple sources managed separately', 'No formal MDM'], painPoint: 'What data quality issues impact your planning process?' },
      { code: '1.7.4', name: 'Manage Planning & Reporting Systems (EPM)', question: 'How are planning and reporting systems managed?', options: ['Dedicated EPM platform centrally managed', 'Finance owns system configuration', 'IT managed with Finance input', 'Excel-based with some tools', 'No formal system management'], painPoint: 'What system limitations impact your FP&A capability?' },
      { code: '1.7.5', name: 'Manage Internal Controls', question: 'How are internal controls managed in the FP&A process?', options: ['Formal control framework', 'Audit-driven controls', 'Finance self-assurance', 'Informal checks', 'No formal controls'], painPoint: 'What control gaps exist in your FP&A process?' },
      { code: '1.7.6', name: 'Process Automation & Digital Tools', question: 'How advanced is your FP&A automation?', options: ['Fully automated end-to-end', 'Partially automated key tasks', 'RPA/macros for repetitive tasks', 'Manual with some tools', 'Largely manual'], painPoint: 'What prevents greater automation in your FP&A process?' },
      { code: '1.7.7', name: 'Govern AI', question: 'How is AI governed in your FP&A process?', options: ['Formal AI governance framework', 'AI use cases piloted with oversight', 'Exploring AI opportunities', 'Limited AI awareness', 'No AI governance'], painPoint: 'What are the barriers to AI adoption in FP&A?' },
      { code: '1.7.8', name: 'Ensure FP&A Team Capability Development', question: 'How is FP&A team capability developed?', options: ['Structured L&D programme', 'On-the-job learning', 'External training/qualifications', 'Ad-hoc training', 'No formal development'], painPoint: 'What capability gaps exist in your FP&A team?' },
      { code: '1.7.9', name: 'Archive & Maintain Records', question: 'How are FP&A records archived and maintained?', options: ['Automated archiving system', 'SharePoint/document management', 'Finance manually archives', 'Email-based', 'No formal archiving'], painPoint: 'What challenges exist in maintaining FP&A records?' },
    ],
    toolQuestion: 'What governance tools and frameworks support your FP&A process?',
    toolOptions: ['Integrated GRC platform', 'EPM governance module', 'SharePoint/intranet', 'Manual/Excel-based'],
  },
]

type Answers = Record<string, { selected: string[]; other: string; painPoint: string }>
type ToolAnswers = Record<string, { selected: string[]; tools: string }>

function AssessmentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const saveToSupabase = async (complete: boolean) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const rows = []
    for (const s of steps) {
      for (const l3 of s.l3s) {
        const ans = answers[l3.code]
        const toolAns = toolAnswers[s.code]
        // Score: map selected options to maturity scores (first option = 5, last = 1)
        let score = 0
        if (ans?.selected?.length > 0) {
          const maxScore = Math.max(...ans.selected.filter(o => o !== 'Other').map(o => {
            const idx = l3.options.indexOf(o)
            if (idx === -1) return 1
            return Math.max(1, 5 - idx)
          }))
          score = maxScore
        }
        rows.push({
          user_id: user.id,
          process_name: 'Plan to Perform',
          step_code: s.code,
          l3_code: l3.code,
          selected_options: ans?.selected || [],
          other_text: ans?.other || '',
          pain_point: ans?.painPoint || '',
          tool_options: toolAns?.selected || [],
          tool_names: toolAns?.tools || '',
          score: score || null,
        })
      }
    }

    for (const row of rows) {
      await supabase.from('assessments').upsert(row, { onConflict: 'user_id,l3_code' })
    }

    // Save effort data
    for (const s of steps) {
      const effort = effortData[s.code]
      if (effort) {
        await supabase.from('process_effort').upsert({
          user_id: user.id,
          process_name: 'Plan to Perform',
          step_code: s.code,
          step_name: s.name,
          headcount: effort.headcount || 0,
          roles: effort.roles || [],
          hours_per_cycle: effort.hoursPerCycle || 0,
          comments: effort.comments || '',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,process_name,step_code' })
      }
    }

    setSaving(false)
    if (complete) router.push('/results')
  }
  const searchParams = useSearchParams()
const codeParam = searchParams.get('code')
const initialStep = codeParam ? Math.max(0, steps.findIndex(s => s.code === codeParam)) : 0
const [currentStep, setCurrentStep] = useState(initialStep)
  const [answers, setAnswers] = useState<Answers>({})
  const [toolAnswers, setToolAnswers] = useState<ToolAnswers>({})
  const [effortData, setEffortData] = useState<Record<string, { headcount: number; roles: string[]; hoursPerCycle: number; comments: string }>>({})

  const step = steps[currentStep]
  const totalAnswered = step.l3s.filter(l3 => answers[l3.code]?.selected?.length > 0).length

  const toggleOption = (l3Code: string, option: string) => {
    setAnswers(prev => {
      const current = prev[l3Code]?.selected || []
      const updated = current.includes(option) ? current.filter(o => o !== option) : [...current, option]
      return { ...prev, [l3Code]: { ...prev[l3Code], selected: updated, other: prev[l3Code]?.other || '', painPoint: prev[l3Code]?.painPoint || '' } }
    })
  }

  const updateOther = (l3Code: string, value: string) => {
    setAnswers(prev => ({ ...prev, [l3Code]: { ...prev[l3Code], selected: prev[l3Code]?.selected || [], other: value, painPoint: prev[l3Code]?.painPoint || '' } }))
  }

  const updatePainPoint = (l3Code: string, value: string) => {
    setAnswers(prev => ({ ...prev, [l3Code]: { ...prev[l3Code], selected: prev[l3Code]?.selected || [], other: prev[l3Code]?.other || '', painPoint: value } }))
  }

  const toggleToolOption = (stepCode: string, option: string) => {
    setToolAnswers(prev => {
      const current = prev[stepCode]?.selected || []
      const updated = current.includes(option) ? current.filter(o => o !== option) : [...current, option]
      return { ...prev, [stepCode]: { ...prev[stepCode], selected: updated, tools: prev[stepCode]?.tools || '' } }
    })
  }

  const updateTools = (stepCode: string, value: string) => {
    setToolAnswers(prev => ({ ...prev, [stepCode]: { ...prev[stepCode], selected: prev[stepCode]?.selected || [], tools: value } }))
  }

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', color: '#1a1a2e', background: 'white', marginTop: '6px' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#f4f6f9' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', background: '#0F4C81', color: 'white', padding: '24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>FPI</div>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Finance Process</span>
        </div>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '32px', marginLeft: '46px' }}>Intelligence Platform</p>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan to Perform</p>
        {steps.map((s, i) => (
          <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', opacity: i === currentStep ? 1 : 0.5 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < currentStep ? '#1d9e75' : i === currentStep ? 'white' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: i === currentStep ? '#0F4C81' : 'white', flexShrink: 0 }}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '12px', color: i === currentStep ? 'white' : '#a0c4e8', fontWeight: i === currentStep ? '600' : '400' }}>{s.name}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '4px', background: '#e0e4ea' }}>
          <div style={{ height: '100%', background: '#1d9e75', width: `${((currentStep + 1) / steps.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ padding: '24px 32px 16px', background: 'white', borderBottom: '1px solid #e0e4ea' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
            Dashboard → Process Explorer → Plan to Perform → {step.code} {step.name}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>
            Step {currentStep + 1} of {steps.length} — {step.name}
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>{step.description}</p>
        </div>

        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {step.l3s.map(l3 => (
              <div key={l3.code} style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#4fa3e0', fontWeight: '700', marginBottom: '4px' }}>{l3.code}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '12px' }}>{l3.name}</div>
                <div style={{ fontSize: '13px', color: '#444', marginBottom: '12px' }}>{l3.question}</div>
                {l3.options.map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={answers[l3.code]?.selected?.includes(opt) || false} onChange={() => toggleOption(l3.code, opt)} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '13px', color: '#333' }}>{opt}</span>
                  </label>
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={answers[l3.code]?.selected?.includes('Other') || false} onChange={() => toggleOption(l3.code, 'Other')} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: '#333' }}>Other</span>
                </label>
                {answers[l3.code]?.selected?.includes('Other') && (
                  <input type="text" placeholder="Please specify..." value={answers[l3.code]?.other || ''} onChange={e => updateOther(l3.code, e.target.value)} style={inputStyle} />
                )}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', marginBottom: '6px' }}>Pain Point: "{l3.painPoint}"</div>
                  <textarea placeholder="Describe your key challenges here..." value={answers[l3.code]?.painPoint || ''} onChange={e => updatePainPoint(l3.code, e.target.value)} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>Tool Usage — {step.name}</div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>{step.toolQuestion}</div>
            {step.toolOptions.map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={toolAnswers[step.code]?.selected?.includes(opt) || false} onChange={() => toggleToolOption(step.code, opt)} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
                <span style={{ fontSize: '13px', color: '#333' }}>{opt}</span>
              </label>
            ))}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>List the main tools or templates used</div>
              <input type="text" placeholder="e.g. Excel, Anaplan, Oracle EPM, SAP BPC, Power BI..." value={toolAnswers[step.code]?.tools || ''} onChange={e => updateTools(step.code, e.target.value)} style={inputStyle} />
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>This helps us assess your planning maturity and recommend the right tool overlays.</div>
            </div>
            {/* Effort Questions */}
            <div style={{ marginTop: '24px', padding: '20px', background: '#f0f7ff', borderRadius: '10px', border: '1px solid #d0e8ff' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F4C81', marginBottom: '16px' }}>👥 Team & Effort</div>
              
              {/* Headcount */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>How many people are involved in this step?</div>
                <input type="number" min="0" placeholder="e.g. 3" value={effortData[step.code]?.headcount || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: parseInt(e.target.value) || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: prev[step.code]?.hoursPerCycle || 0 } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '120px', color: '#333', background: 'white' }} />
              </div>

              {/* Roles */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>What roles are involved? (select all that apply)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {['CFO / Finance Director', 'Financial Controller', 'FP&A Manager / Analyst', 'Management Accountant', 'Financial Accountant', 'Accounts Payable / Receivable', 'Treasury Analyst', 'Tax Manager', 'Business Partner', 'Operations Manager', 'Department Budget Holder', 'ERP/Systems Administrator', 'IT Manager', 'Data Analyst / BI Developer', 'External Auditor', 'Outsourced Provider'].map(role => (
                    <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={effortData[step.code]?.roles?.includes(role) || false} onChange={() => {
                        const current = effortData[step.code]?.roles || []
                        const updated = current.includes(role) ? current.filter(r => r !== role) : [...current, role]
                        setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: updated, hoursPerCycle: prev[step.code]?.hoursPerCycle || 0 } }))
                      }} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '12px', color: '#333' }}>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hours per cycle */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>How many hours per planning cycle does the team spend on this step?</div>
                <input type="number" min="0" placeholder="e.g. 40" value={effortData[step.code]?.hoursPerCycle || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: parseInt(e.target.value) || 0 } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '120px', color: '#333', background: 'white' }} />
              </div>

              {/* Additional comments */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Any additional comments about this step's team or effort?</div>
                <textarea placeholder="e.g. This step is shared with the FP&A team during peak periods..." value={effortData[step.code]?.comments || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: prev[step.code]?.hoursPerCycle || 0, comments: e.target.value } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '100%', minHeight: '80px', resize: 'vertical', color: '#333', background: 'white' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 32px', background: 'white', borderTop: '1px solid #e0e4ea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.push('/process-explorer')} style={{ padding: '10px 20px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            ← Back
          </button>
          <div style={{ fontSize: '13px', color: '#666' }}>{totalAnswered} of {step.l3s.length} answered</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => saveToSupabase(false)} disabled={saving} style={{ padding: '10px 20px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save Progress'}
            </button>
            {currentStep < steps.length - 1 ? (
              <button onClick={() => setCurrentStep(currentStep + 1)} style={{ padding: '10px 24px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Next: {steps[currentStep + 1].name} →
              </button>
            ) : (
              <button onClick={() => saveToSupabase(true)} disabled={saving} style={{ padding: '10px 24px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Complete Assessment →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}export default function AssessmentPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssessmentPage />
    </Suspense>
  )
}