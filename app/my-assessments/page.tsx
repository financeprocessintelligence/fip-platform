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
  { name: 'Project to Result', code: 'p2r', totalSteps: 11, available: true, description: 'Project accounting, EVM, billing, capitalisation and connected planning' },
  { name: 'Source to Procure', code: 's2p', totalSteps: 8, available: false, description: 'Procurement strategy, sourcing, contracting and supplier management' },
{ name: 'Procure to Pay', code: 'ptp', totalSteps: 13, available: true, description: 'Requisitioning, purchasing, receiving, invoicing and payment management' },
  { name: 'Acquire to Retire', code: 'a2r', totalSteps: 6, available: false, description: 'Asset management, depreciation and disposal' },
  { name: 'Transact to Record', code: 't2r', totalSteps: 7, available: false, description: 'Transaction processing and accounting operations' },
]

export default function MyAssessmentsPage() {
  const router = useRouter()
  const [processSummaries, setProcessSummaries] = useState<ProcessSummary[]>([])
  const [loading, setLoading] = useState(true)
const [p2pResponses, setP2pResponses] = useState<Record<string, any>>({})
const [p2pEffort, setP2pEffort] = useState<Record<string, any>>({})
const [r2rResponses, setR2rResponses] = useState<Record<string, any>>({})
const [r2rEffort, setR2rEffort] = useState<Record<string, any>>({})

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
// Fetch R2R responses
const { data: r2rResponseData } = await supabase
  .from('assessments')
  .select('l3_code, selected_options, pain_point, score, tool_options, tool_names, other_text')
  .eq('user_id', user.id)
  .eq('process_name', 'Record to Report')

const r2rResponseMap: Record<string, any> = {}
if (r2rResponseData) {
  r2rResponseData.forEach(r => { r2rResponseMap[r.l3_code] = r })
}
setR2rResponses(r2rResponseMap)

// Fetch R2R effort data
const { data: r2rEffortData } = await supabase
  .from('process_effort')
  .select('step_code, headcount, roles, hours_per_cycle, hourly_rate, saving_percent, comments')
  .eq('user_id', user.id)
  .eq('process_name', 'Record to Report')

const r2rEffortMap: Record<string, any> = {}
if (r2rEffortData) {
  r2rEffortData.forEach(r => { r2rEffortMap[r.step_code] = r })
}
setR2rEffort(r2rEffortMap)

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
  
const r2rSteps = [
  {
    code: '1.1',
    name: 'Close General Ledger Data Sources',
    l3s: [
      { code: '1.1.1', name: 'Close & Transfer General Ledger Data Sources', options: ['Automated via ERP with system-enforced close', 'Scheduled batch jobs with Finance oversight', 'Manual process with checklist', 'Ad-hoc based on individual judgment', 'No formal process'] },
      { code: '1.1.2', name: 'Reconcile General Ledger Data Sources', options: ['Automated reconciliation with exception reporting', 'System-assisted with manual review', 'Manual reconciliation using spreadsheets', 'Reconciliation performed inconsistently', 'No formal reconciliation process'] },
      { code: '1.1.3', name: 'Perform Intercompany Reconciliations', options: ['Automated matching via dedicated IC tool', 'ERP-based matching with manual resolution', 'Manual matching via spreadsheets', 'Reconciliation done inconsistently across entities', 'No formal intercompany reconciliation'] },
    ],
    toolOptions: ['ERP automated close (SAP, Oracle, etc.)', 'Dedicated reconciliation tool', 'Spreadsheet-based', 'Manual/no formal tool'],
  },
  {
    code: '1.2',
    name: 'Pre-Close Activities',
    l3s: [
      { code: '1.2.1', name: 'Record Journal Entries', options: ['Automated journals via ERP with workflow approval', 'Preparer/approver workflow in ERP', 'Manual entries with offline approval', 'Entries recorded without formal approval', 'No defined process'] },
      { code: '1.2.2', name: 'Process General Ledger Allocations', options: ['Automated allocation rules in ERP', 'System-assisted with manual override', 'Manual allocation via journal entries', 'Allocations done inconsistently', 'No formal allocation process'] },
      { code: '1.2.3', name: 'Record Statutory Journal Entries', options: ['Automated based on defined rules', 'Finance team prepares with technical review', 'Ad-hoc based on accounting team judgment', 'Inconsistently applied across entities', 'No defined process'] },
      { code: '1.2.4', name: 'Perform GL Foreign Currency Accounting', options: ['Automated revaluation via ERP', 'System-calculated with manual review', 'Manual calculation and journal entry', 'Done inconsistently across currencies', 'No formal FX accounting process'] },
      { code: '1.2.5', name: 'Process Local Tax Calculations & Journal Entries', options: ['Integrated tax engine with automated journals', 'Tax team calculates with Finance posting', 'Manual calculation and entry', 'Inconsistent across jurisdictions', 'No formal process'] },
      { code: '1.2.6', name: 'Perform Journal Review Checks', options: ['Automated validation rules in ERP', 'Structured peer review process', 'Manager spot-check review', 'Minimal review performed', 'No journal review process'] },
    ],
    toolOptions: ['ERP journal workflow', 'Dedicated close management tool', 'Spreadsheet-based', 'Manual process'],
  },
  {
    code: '1.3',
    name: 'Preliminary Financial Reviews & GL Close',
    l3s: [
      { code: '1.3.1', name: 'Review Trial Balance', options: ['Automated variance analysis with thresholds', 'Finance team structured review', 'Manager-level spot check', 'Minimal review performed', 'No formal trial balance review'] },
      { code: '1.3.2', name: 'Review Preliminary Financial Statements', options: ['Structured multi-level review with sign-off', 'CFO/Finance Director review', 'Team-level review only', 'Informal review without documentation', 'No formal review process'] },
      { code: '1.3.3', name: 'Record Management & Corporate Adjustments', options: ['Formal adjustment process with documented rationale', 'CFO-approved adjustments with journal entries', 'Ad-hoc adjustments as needed', 'Inconsistent adjustment process', 'No formal adjustment process'] },
      { code: '1.3.4', name: 'Close General Ledger', options: ['System-enforced close with automated lock', 'Finance team closes with IT support', 'Manual period close process', 'Close performed inconsistently', 'No formal GL close process'] },
      { code: '1.3.5', name: 'Manage and Perform Period End Reconciliations', options: ['Automated reconciliation platform', 'Structured reconciliation programme with tracking', 'Individual reconciliations without central oversight', 'Reconciliations done selectively', 'No formal reconciliation programme'] },
    ],
    toolOptions: ['Close management platform', 'ERP standard close', 'Reconciliation tool', 'Spreadsheet-based'],
  },
  {
    code: '1.4',
    name: 'Intercompany Accounting & Eliminations',
    l3s: [
      { code: '1.4.1', name: 'Process Intercompany Transactions', options: ['Automated IC transaction matching in ERP', 'Centralised IC team with defined processes', 'Decentralised with coordination between entities', 'Ad-hoc processing without standards', 'No formal IC transaction process'] },
      { code: '1.4.2', name: 'Perform Intercompany Matching & Reconciliation', options: ['Automated matching with exception management', 'System-assisted matching with manual resolution', 'Manual matching via spreadsheets', 'Matching done inconsistently', 'No formal matching process'] },
      { code: '1.4.3', name: 'Resolve Intercompany Disputes', options: ['Defined escalation process with SLAs', 'Cross-entity finance team resolution', 'Ad-hoc resolution between entities', 'Disputes often left unresolved', 'No formal dispute resolution process'] },
      { code: '1.4.4', name: 'Process Intercompany Eliminations', options: ['Automated eliminations in consolidation system', 'System-generated with manual review', 'Manual elimination journals', 'Eliminations done inconsistently', 'No formal elimination process'] },
    ],
    toolOptions: ['Dedicated IC management tool', 'Consolidation system IC module', 'ERP-based', 'Spreadsheet-based'],
  },
  {
    code: '1.5',
    name: 'Financial Consolidation',
    l3s: [
      { code: '1.5.1', name: 'Preliminary Consolidation Processes & Checks', options: ['Automated validation rules in consolidation system', 'Structured pre-consolidation checklist', 'Finance team manual checks', 'Minimal pre-consolidation review', 'No formal preliminary checks'] },
      { code: '1.5.2', name: 'Process Currency Translations', options: ['Automated in consolidation system with defined rates', 'System-calculated with Finance rate management', 'Manual calculation and journal', 'Inconsistent approach across entities', 'No formal currency translation process'] },
      { code: '1.5.3', name: 'Process Intercompany Eliminations', options: ['Automated eliminations in consolidation system', 'System-generated with review', 'Manual elimination entries', 'Done inconsistently', 'No formal process'] },
      { code: '1.5.4', name: 'Process Consolidation Adjustments', options: ['Formal adjustment process with documented rationale', 'Group Finance team controlled adjustments', 'Ad-hoc adjustments as needed', 'Inconsistent process', 'No formal adjustment process'] },
      { code: '1.5.5', name: 'Process Tax Calculations & Consolidated Tax Journal Entries', options: ['Integrated tax engine with automated journals', 'Tax team calculates with Group Finance posting', 'Manual calculation and entry', 'Inconsistent across jurisdictions', 'No formal process'] },
      { code: '1.5.6', name: 'Close Corporate Consolidation Ledger', options: ['System-enforced close in consolidation platform', 'Group Finance controlled close', 'Manual close process', 'Close performed inconsistently', 'No formal consolidation close'] },
    ],
    toolOptions: ['Dedicated consolidation platform (HFM, BPC, etc.)', 'ERP consolidation module', 'Spreadsheet-based', 'No formal tool'],
  },
  {
    code: '1.6',
    name: 'Period End Reporting',
    l3s: [
      { code: '1.6.1', name: 'Prepare External Reporting & Notes to the Financials', options: ['Automated population from consolidation system', 'Structured preparation process with templates', 'Manual preparation by accounting team', 'Ad-hoc preparation each period', 'No formal preparation process'] },
      { code: '1.6.2', name: 'Prepare Statutory Filings & Reporting', options: ['XBRL/iXBRL automated filing', 'Structured filing process with compliance checks', 'Manual preparation and submission', 'Inconsistent across jurisdictions', 'No formal filing process'] },
      { code: '1.6.3', name: 'Prepare Shareholder Reporting & Manage Investor Relations', options: ['Structured investor relations process with Board review', 'Finance and IR team collaboration', 'Finance-led preparation with ad-hoc IR input', 'Minimal formal shareholder reporting', 'No formal process'] },
      { code: '1.6.4', name: 'Prepare Regulatory Reporting', options: ['Automated regulatory reporting solution', 'Dedicated compliance team with structured process', 'Finance team manual preparation', 'Inconsistent across regulatory requirements', 'No formal regulatory reporting process'] },
      { code: '1.6.5', name: 'Prepare Financial Management Reporting', options: ['Automated from BI/analytics platform', 'Structured reporting pack with defined templates', 'Manual preparation each period', 'Ad-hoc reporting on request', 'No formal management reporting process'] },
    ],
    toolOptions: ['Dedicated reporting platform', 'BI/analytics tool', 'ERP standard reports', 'Spreadsheet-based'],
  },
  {
    code: '1.7',
    name: 'Management Reporting & Commentary',
    l3s: [
      { code: '1.7.1', name: 'Prepare Management Accounts Pack', options: ['Automated population from data warehouse/BI', 'Structured preparation with defined templates', 'Manual compilation each period', 'Ad-hoc preparation based on requests', 'No formal management accounts process'] },
      { code: '1.7.2', name: 'Write CFO Commentary & Narrative', options: ['AI-assisted narrative generation', 'Structured template with Finance input', 'CFO writes with Finance support', 'Ad-hoc narrative without structure', 'No formal commentary process'] },
      { code: '1.7.3', name: 'Distribute Reports to Stakeholders', options: ['Automated distribution via reporting platform', 'Scheduled email distribution with version control', 'Manual distribution to stakeholders', 'Ad-hoc distribution on request', 'No formal distribution process'] },
      { code: '1.7.4', name: 'Gather Management Feedback & Actions', options: ['Structured feedback process with action tracking', 'Regular review meetings with action log', 'Informal feedback collection', 'Minimal feedback gathered', 'No formal feedback process'] },
    ],
    toolOptions: ['BI/analytics platform', 'Reporting automation tool', 'Presentation software', 'Spreadsheet-based'],
  },
  {
    code: '1.8',
    name: 'Technical Accounting',
    l3s: [
      { code: '1.8.1', name: 'Understand & Interpret New Accounting Pronouncements', options: ['Dedicated technical accounting team with structured process', 'Finance team with external advisor support', 'Ad-hoc interpretation as standards are issued', 'Reactive interpretation when issues arise', 'No formal technical accounting process'] },
      { code: '1.8.2', name: 'Identify & Monitor Accounting Issues', options: ['Proactive monitoring with issue tracking system', 'Regular technical accounting reviews', 'Ad-hoc identification when issues arise', 'Reactive response to audit findings', 'No formal issue monitoring process'] },
      { code: '1.8.3', name: 'Maintain Disclosures', options: ['Automated disclosure management system', 'Structured disclosure checklist and review', 'Manual maintenance by accounting team', 'Ad-hoc updates as required', 'No formal disclosure management process'] },
      { code: '1.8.4', name: 'Maintain & Publish Accounting Policies', options: ['Central policy management system with version control', 'Finance team maintains with regular review cycle', 'Ad-hoc updates when needed', 'Policies exist but are rarely updated', 'No formal accounting policy management'] },
    ],
    toolOptions: ['Dedicated technical accounting tool', 'Document management system', 'Shared drive/intranet', 'Manual/no formal tool'],
  },
  {
    code: '1.9',
    name: 'Manage Process',
    l3s: [
      { code: '1.9.1', name: 'Manage Close Process & Calendar', options: ['Automated close management platform with task tracking', 'Centralised calendar with Finance ownership', 'Shared calendar with informal tracking', 'Informal close schedule', 'No formal close calendar'] },
      { code: '1.9.2', name: 'Maintain Policies, Procedures, Standards & Templates', options: ['Central repository with version control and review cycle', 'Finance team maintains and distributes', 'SharePoint/intranet based', 'Ad-hoc updates as needed', 'No formal policy management'] },
      { code: '1.9.3', name: 'Maintain Internal Controls', options: ['Integrated GRC platform with automated testing', 'Formal control framework with periodic testing', 'Audit-driven controls', 'Informal control checks', 'No formal control framework'] },
      { code: '1.9.4', name: 'Manage External Audit', options: ['Structured audit management with dedicated team', 'Finance team leads with clear ownership', 'Ad-hoc response to auditor requests', 'Reactive audit management', 'No formal audit management process'] },
      { code: '1.9.5', name: 'Manage Process Efficiency & Effectiveness', options: ['KPIs tracked with continuous improvement programme', 'Regular process reviews with improvement actions', 'Ad-hoc improvement initiatives', 'Minimal measurement of process performance', 'No formal efficiency management'] },
      { code: '1.9.6', name: 'Enhance Business Partner and Employee Experience', options: ['Dedicated business partnering model with SLAs', 'Finance team provides proactive support', 'Reactive support to business requests', 'Minimal business partnering', 'No formal business partnering in R2R'] },
      { code: '1.9.7', name: 'Archive & Maintain Records', options: ['Automated archiving with retention policies', 'Structured archive management process', 'Manual archiving by Finance team', 'Ad-hoc archiving', 'No formal record management'] },
    ],
    toolOptions: ['Close management platform', 'GRC/controls tool', 'Document management system', 'Manual/spreadsheet-based'],
  },
  {
    code: '1.10',
    name: 'System Governance',
    l3s: [
      { code: '1.10.1', name: 'Maintain Data Model', options: ['Formal MDM process with governance board', 'Finance and IT jointly manage', 'IT manages with Finance input', 'Ad-hoc changes as required', 'No formal data model governance'] },
      { code: '1.10.2', name: 'Maintain Application Configuration & Security', options: ['Formal configuration management with change control', 'IT manages with Finance oversight', 'IT manages independently', 'Ad-hoc configuration changes', 'No formal configuration management'] },
      { code: '1.10.3', name: 'Manage Application Releases & Upgrades', options: ['Formal release management with testing protocols', 'IT-led with Finance UAT', 'Minimal testing before release', 'Reactive upgrade management', 'No formal release management'] },
      { code: '1.10.4', name: 'Maintain Reports', options: ['Centralised report catalogue with version control', 'Finance team maintains standard reports', 'IT manages report library', 'Ad-hoc report maintenance', 'No formal report management'] },
      { code: '1.10.5', name: 'Manage Interfaces', options: ['Automated interface monitoring with alerting', 'IT team manages with Finance oversight', 'IT manages independently', 'Reactive interface management', 'No formal interface management'] },
      { code: '1.10.6', name: 'Maintain Process Automation & Digital Labor', options: ['Centre of excellence for automation with formal governance', 'IT and Finance jointly manage automation', 'Ad-hoc automation maintenance', 'Minimal automation in place', 'No formal automation programme'] },
    ],
    toolOptions: ['ERP with formal governance', 'Dedicated ITSM tool', 'Manual governance process', 'No formal system governance'],
  },
  {
    code: '1.11',
    name: 'AI & Intelligent Automation',
    l3s: [
      { code: '1.11.1', name: 'AI-Assisted Journal Entry Processing', options: ['AI suggests and auto-posts routine journals', 'AI flags anomalies for review', 'Basic automation for recurring journals only', 'Exploring AI for journal processing', 'No AI in journal processing'] },
      { code: '1.11.2', name: 'Automated Reconciliations', options: ['Fully automated with AI matching', 'High match rate with exception-only review', 'Partially automated key reconciliations', 'Basic automation for simple reconciliations', 'Largely manual reconciliations'] },
      { code: '1.11.3', name: 'Intelligent Close Management', options: ['AI predicts close risks and optimises sequencing', 'Automated task tracking with smart alerts', 'Basic close tracking tool', 'Spreadsheet-based close tracking', 'No intelligent close management'] },
      { code: '1.11.4', name: 'Predictive Reporting & Analytics', options: ['AI-driven predictive analytics and commentary', 'Advanced analytics with some predictive elements', 'Standard BI reporting with historical analysis', 'Basic reporting without analytics', 'No predictive capabilities'] },
      { code: '1.11.5', name: 'AI-Powered Anomaly Detection', options: ['AI-powered continuous anomaly detection', 'Automated threshold-based alerting', 'Manual variance analysis', 'Ad-hoc anomaly identification', 'No formal anomaly detection'] },
    ],
    toolOptions: ['Dedicated AI/ML platform', 'RPA tools', 'ERP automation features', 'No AI or automation in use'],
  },
  {
    code: '1.12',
    name: 'Continuous Improvement',
    l3s: [
      { code: '1.12.1', name: 'Process Performance Monitoring', options: ['Real-time KPI dashboard with automated alerts', 'Regular KPI reporting with trend analysis', 'Periodic performance reviews', 'Ad-hoc performance measurement', 'No formal performance monitoring'] },
      { code: '1.12.2', name: 'Benchmark & Maturity Assessment', options: ['Regular external benchmarking with industry peers', 'Internal benchmarking across entities', 'Ad-hoc benchmarking when issues arise', 'Limited benchmarking activity', 'No formal benchmarking'] },
      { code: '1.12.3', name: 'Finance Transformation Roadmap', options: ['Formal transformation programme with dedicated team', 'Finance leadership owns roadmap with regular reviews', 'Ad-hoc improvement initiatives without roadmap', 'Limited transformation planning', 'No formal transformation roadmap'] },
    ],
    toolOptions: ['Dedicated process improvement tool', 'Project management platform', 'Spreadsheet-based tracking', 'No formal improvement programme'],
  },
]

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

  const handleDownloadTemplateR2R = () => {
    const rows: string[][] = [['Step Code', 'Step Name', 'L3 Code', 'L3 Name', 'Available Options', 'Selected Options (semicolon separated)', 'Pain Point', 'Score (1-5)', 'Type']]
    for (const s of r2rSteps) {
      for (const l3 of s.l3s) {
        const r = r2rResponses[l3.code] || {}
        const selected = (r.selected_options || []).join('; ')
        const painPoint = r.pain_point || ''
        const score = r.score != null ? String(r.score) : ''
        rows.push([s.code, s.name, l3.code, l3.name, l3.options.join('; '), selected, painPoint, score, 'L3'])
      }
      const firstL3Code = s.l3s[0]?.code
      const firstL3R = firstL3Code ? (r2rResponses[firstL3Code] || {}) : {}
      const toolSelected = (firstL3R.tool_options || []).join('; ')
      rows.push([s.code, s.name, 'TOOL', 'Tool Usage', s.toolOptions.join('; '), toolSelected, '', '', 'TOOL'])
      const eff = r2rEffort[s.code] || {}
      const effortRoles = 'CFO / Finance Director; Financial Controller; FP&A Manager / Analyst; Management Accountant; Financial Accountant; Accounts Payable / Receivable; Treasury Analyst; Tax Manager; Business Partner; Operations Manager; Department Budget Holder; ERP/Systems Administrator; IT Manager; Data Analyst / BI Developer; External Auditor; Outsourced Provider'
      const effortVal = [
        eff.headcount || '',
        eff.hours_per_cycle || '',
        (eff.roles || ''),
        eff.comments || ''
      ].join(' | ')
      rows.push([s.code, s.name, 'EFFORT', 'Team & Effort', `Headcount | Hours per cycle | Roles (from: ${effortRoles}) | Comments`, effortVal, '', '', 'EFFORT'])
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'record-to-report-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

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
      const cols: string[] = []
let current = ''
let inQuotes = false
for (let i = 0; i < line.length; i++) {
  const char = line[i]
  if (char === '"') {
    inQuotes = !inQuotes
  } else if (char === ',' && !inQuotes) {
    cols.push(current.trim())
    current = ''
  } else {
    current += char
  }
}
cols.push(current.trim())
      return cols
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    
    let currentStepCode = ''
    for (const row of rows) {
      const [, , l3Code, , availableRaw, selectedRaw, painPoint, scoreRaw, type] = row
const rowType = type || painPoint
// Derive step code from l3Code to avoid Excel corrupting 1.10 -> 1.1
const isToolOrEffort = rowType === 'TOOL' || rowType === 'EFFORT'
const stepCode = isToolOrEffort ? currentStepCode : l3Code.split('.').slice(0, 2).join('.')
if (!isToolOrEffort) currentStepCode = stepCode
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
        const { error: effortError } = await supabase.from('process_effort').upsert({
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
      <div style={{ width: '240px', background: '#0F4C81', color: 'white', padding: '24px 16px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>FPI</div>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Finance Process</span>
        </div>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '32px', marginLeft: '46px' }}>Intelligence Platform</p>
        {['Dashboard', 'My Assessments', 'Process Explorer', 'Reports', 'Settings', 'Sign Out'].map(item => (
          <div key={item} onClick={async () => {
            if (item === 'Dashboard') router.push('/dashboard')
            if (item === 'My Assessments') router.push('/my-assessments')
            if (item === 'Process Explorer') router.push('/process-explorer')
            if (item === 'Reports') router.push('/reports')
            if (item === 'Settings') router.push('/settings')
            if (item === 'Sign Out') { await supabase.auth.signOut(); router.push('/') }
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
                          <button onClick={() => router.push(p.processName === 'Record to Report' ? '/results-r2r' : p.processName === 'Procure to Pay' ? '/results-ptp' : p.processName === 'Project to Result' ? '/results-p2r' : '/results')} style={{ padding: '10px 20px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            View Results →
                          </button>
                        ) : null}
                        {(p.processName === 'Plan to Perform' || p.processName === 'Record to Report') && (
                          <>
                            <button onClick={() => p.processName === 'Record to Report' ? handleDownloadTemplateR2R() : handleDownloadTemplate()} style={{ padding: '10px 20px', background: 'white', color: '#1d9e75', border: '1px solid #1d9e75', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>⬇ Template</button>
                            <label style={{ padding: '10px 20px', background: 'white', color: '#1d9e75', border: '1px solid #1d9e75', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                              ⬆ Import
                              <input type="file" accept=".csv" onChange={e => handleImportCSV(e, p.processName)} style={{ display: 'none' }} />
                            </label>
                          </>
                        )}
                        <button onClick={() => router.push(p.processName === 'Record to Report' ? '/assessment-r2r' : p.processName === 'Procure to Pay' ? '/assessment-ptp' : p.processName === 'Project to Result' ? '/assessment-p2r' : '/assessment')} style={{ padding: '10px 20px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
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
                      <button onClick={() => router.push(p.code === 'ptp' ? '/assessment-ptp' : '/assessment')} style={{ padding: '8px 18px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
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