'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const steps = [
  {
    code: '1.1',
    name: 'Close General Ledger Data Sources',
    description: 'Manage the closing and transfer of all sub-ledger data into the general ledger.',
    l3s: [
      { code: '1.1.1', name: 'Close & Transfer General Ledger Data Sources', question: 'How are sub-ledger data sources closed and transferred to the GL?', options: ['Automated via ERP with system-enforced close', 'Scheduled batch jobs with Finance oversight', 'Manual process with checklist', 'Ad-hoc based on individual judgment', 'No formal process'], painPoint: 'What causes delays or errors when closing and transferring GL data sources?' },
      { code: '1.1.2', name: 'Reconcile General Ledger Data Sources', question: 'How are GL data sources reconciled at period end?', options: ['Automated reconciliation with exception reporting', 'System-assisted with manual review', 'Manual reconciliation using spreadsheets', 'Reconciliation performed inconsistently', 'No formal reconciliation process'], painPoint: 'What are the biggest challenges in reconciling GL data sources?' },
      { code: '1.1.3', name: 'Perform Intercompany Reconciliations', question: 'How are intercompany balances reconciled?', options: ['Automated matching via dedicated IC tool', 'ERP-based matching with manual resolution', 'Manual matching via spreadsheets', 'Reconciliation done inconsistently across entities', 'No formal intercompany reconciliation'], painPoint: 'What causes intercompany reconciliation differences and delays?' },
    ],
    toolQuestion: 'What tools support your GL data source closing and reconciliation?',
    toolOptions: ['ERP automated close (SAP, Oracle, etc.)', 'Dedicated reconciliation tool', 'Spreadsheet-based', 'Manual/no formal tool'],
  },
  {
    code: '1.2',
    name: 'Pre-Close Activities',
    description: 'Complete all journal entries, allocations and adjustments before the period close.',
    l3s: [
      { code: '1.2.1', name: 'Record Journal Entries', question: 'How are journal entries recorded and approved?', options: ['Automated journals via ERP with workflow approval', 'Preparer/approver workflow in ERP', 'Manual entries with offline approval', 'Entries recorded without formal approval', 'No defined process'], painPoint: 'What causes journal entry errors or delays?' },
      { code: '1.2.2', name: 'Process General Ledger Allocations', question: 'How are GL allocations processed?', options: ['Automated allocation rules in ERP', 'System-assisted with manual override', 'Manual allocation via journal entries', 'Allocations done inconsistently', 'No formal allocation process'], painPoint: 'What causes allocation errors or disputes?' },
      { code: '1.2.3', name: 'Record Statutory Journal Entries', question: 'How are statutory journals recorded?', options: ['Automated based on defined rules', 'Finance team prepares with technical review', 'Ad-hoc based on accounting team judgment', 'Inconsistently applied across entities', 'No defined process'], painPoint: 'What challenges exist in recording statutory journals accurately?' },
      { code: '1.2.4', name: 'Perform GL Foreign Currency Accounting', question: 'How is foreign currency accounting performed?', options: ['Automated revaluation via ERP', 'System-calculated with manual review', 'Manual calculation and journal entry', 'Done inconsistently across currencies', 'No formal FX accounting process'], painPoint: 'What causes FX accounting errors or reconciliation issues?' },
      { code: '1.2.5', name: 'Process Local Tax Calculations & Journal Entries', question: 'How are local tax calculations and journals processed?', options: ['Integrated tax engine with automated journals', 'Tax team calculates with Finance posting', 'Manual calculation and entry', 'Inconsistent across jurisdictions', 'No formal process'], painPoint: 'What causes tax journal errors or compliance risks?' },
      { code: '1.2.6', name: 'Perform Journal Review Checks', question: 'How are journals reviewed and validated before close?', options: ['Automated validation rules in ERP', 'Structured peer review process', 'Manager spot-check review', 'Minimal review performed', 'No journal review process'], painPoint: 'What types of errors are most commonly found during journal reviews?' },
    ],
    toolQuestion: 'What tools support your pre-close journal and allocation processes?',
    toolOptions: ['ERP journal workflow', 'Dedicated close management tool', 'Spreadsheet-based', 'Manual process'],
  },
  {
    code: '1.3',
    name: 'Preliminary Financial Reviews & GL Close',
    description: 'Review financial statements and close the general ledger for the period.',
    l3s: [
      { code: '1.3.1', name: 'Review Trial Balance', question: 'How is the trial balance reviewed before close?', options: ['Automated variance analysis with thresholds', 'Finance team structured review', 'Manager-level spot check', 'Minimal review performed', 'No formal trial balance review'], painPoint: 'What issues are most commonly identified during trial balance review?' },
      { code: '1.3.2', name: 'Review Preliminary Financial Statements', question: 'How are preliminary financials reviewed?', options: ['Structured multi-level review with sign-off', 'CFO/Finance Director review', 'Team-level review only', 'Informal review without documentation', 'No formal review process'], painPoint: 'What causes late changes to financial statements after preliminary review?' },
      { code: '1.3.3', name: 'Record Management & Corporate Adjustments', question: 'How are management and corporate adjustments recorded?', options: ['Formal adjustment process with documented rationale', 'CFO-approved adjustments with journal entries', 'Ad-hoc adjustments as needed', 'Inconsistent adjustment process', 'No formal adjustment process'], painPoint: 'What causes disputes or errors in management adjustments?' },
      { code: '1.3.4', name: 'Close General Ledger', question: 'How is the general ledger formally closed?', options: ['System-enforced close with automated lock', 'Finance team closes with IT support', 'Manual period close process', 'Close performed inconsistently', 'No formal GL close process'], painPoint: 'What causes the GL close to be delayed or reopened?' },
      { code: '1.3.5', name: 'Manage and Perform Period End Reconciliations', question: 'How are period end reconciliations managed?', options: ['Automated reconciliation platform', 'Structured reconciliation programme with tracking', 'Individual reconciliations without central oversight', 'Reconciliations done selectively', 'No formal reconciliation programme'], painPoint: 'What makes period end reconciliations time-consuming or unreliable?' },
    ],
    toolQuestion: 'What tools support your GL review and close process?',
    toolOptions: ['Close management platform', 'ERP standard close', 'Reconciliation tool', 'Spreadsheet-based'],
  },
  {
    code: '1.4',
    name: 'Intercompany Accounting & Eliminations',
    description: 'Manage intercompany transactions, matching and elimination processes.',
    l3s: [
      { code: '1.4.1', name: 'Process Intercompany Transactions', question: 'How are intercompany transactions processed?', options: ['Automated IC transaction matching in ERP', 'Centralised IC team with defined processes', 'Decentralised with coordination between entities', 'Ad-hoc processing without standards', 'No formal IC transaction process'], painPoint: 'What causes intercompany transaction errors or timing differences?' },
      { code: '1.4.2', name: 'Perform Intercompany Matching & Reconciliation', question: 'How is IC matching and reconciliation performed?', options: ['Automated matching with exception management', 'System-assisted matching with manual resolution', 'Manual matching via spreadsheets', 'Matching done inconsistently', 'No formal matching process'], painPoint: 'What causes intercompany matching differences to persist?' },
      { code: '1.4.3', name: 'Resolve Intercompany Disputes', question: 'How are intercompany disputes resolved?', options: ['Defined escalation process with SLAs', 'Cross-entity finance team resolution', 'Ad-hoc resolution between entities', 'Disputes often left unresolved', 'No formal dispute resolution process'], painPoint: 'What causes intercompany disputes to take long to resolve?' },
      { code: '1.4.4', name: 'Process Intercompany Eliminations', question: 'How are IC eliminations processed during consolidation?', options: ['Automated eliminations in consolidation system', 'System-generated with manual review', 'Manual elimination journals', 'Eliminations done inconsistently', 'No formal elimination process'], painPoint: 'What causes intercompany elimination errors?' },
    ],
    toolQuestion: 'What tools support your intercompany accounting process?',
    toolOptions: ['Dedicated IC management tool', 'Consolidation system IC module', 'ERP-based', 'Spreadsheet-based'],
  },
  {
    code: '1.5',
    name: 'Financial Consolidation',
    description: 'Consolidate financial results across all entities, currencies and structures.',
    l3s: [
      { code: '1.5.1', name: 'Preliminary Consolidation Processes & Checks', question: 'How are preliminary consolidation checks performed?', options: ['Automated validation rules in consolidation system', 'Structured pre-consolidation checklist', 'Finance team manual checks', 'Minimal pre-consolidation review', 'No formal preliminary checks'], painPoint: 'What issues are most commonly found during preliminary consolidation?' },
      { code: '1.5.2', name: 'Process Currency Translations', question: 'How are currency translations processed?', options: ['Automated in consolidation system with defined rates', 'System-calculated with Finance rate management', 'Manual calculation and journal', 'Inconsistent approach across entities', 'No formal currency translation process'], painPoint: 'What causes currency translation errors or disputes?' },
      { code: '1.5.3', name: 'Process Intercompany Eliminations', question: 'How are consolidation-level IC eliminations processed?', options: ['Automated eliminations in consolidation system', 'System-generated with review', 'Manual elimination entries', 'Done inconsistently', 'No formal process'], painPoint: 'What causes consolidation IC elimination differences?' },
      { code: '1.5.4', name: 'Process Consolidation Adjustments', question: 'How are consolidation adjustments managed?', options: ['Formal adjustment process with documented rationale', 'Group Finance team controlled adjustments', 'Ad-hoc adjustments as needed', 'Inconsistent process', 'No formal adjustment process'], painPoint: 'What causes consolidation adjustments to be disputed or delayed?' },
      { code: '1.5.5', name: 'Process Tax Calculations & Consolidated Tax Journal Entries', question: 'How are consolidated tax calculations processed?', options: ['Integrated tax engine with automated journals', 'Tax team calculates with Group Finance posting', 'Manual calculation and entry', 'Inconsistent across jurisdictions', 'No formal process'], painPoint: 'What causes consolidated tax calculation errors?' },
      { code: '1.5.6', name: 'Close Corporate Consolidation Ledger', question: 'How is the consolidation ledger formally closed?', options: ['System-enforced close in consolidation platform', 'Group Finance controlled close', 'Manual close process', 'Close performed inconsistently', 'No formal consolidation close'], painPoint: 'What causes the consolidation close to be delayed?' },
    ],
    toolQuestion: 'What tools support your financial consolidation process?',
    toolOptions: ['Dedicated consolidation platform (HFM, BPC, etc.)', 'ERP consolidation module', 'Spreadsheet-based', 'No formal tool'],
  },
  {
    code: '1.6',
    name: 'Period End Reporting',
    description: 'Prepare and publish all external and regulatory financial reports.',
    l3s: [
      { code: '1.6.1', name: 'Prepare External Reporting & Notes to the Financials', question: 'How are external financial reports and notes prepared?', options: ['Automated population from consolidation system', 'Structured preparation process with templates', 'Manual preparation by accounting team', 'Ad-hoc preparation each period', 'No formal preparation process'], painPoint: 'What causes delays or errors in external financial reporting?' },
      { code: '1.6.2', name: 'Prepare Statutory Filings & Reporting', question: 'How are statutory filings prepared and submitted?', options: ['XBRL/iXBRL automated filing', 'Structured filing process with compliance checks', 'Manual preparation and submission', 'Inconsistent across jurisdictions', 'No formal filing process'], painPoint: 'What causes statutory filing errors or late submissions?' },
      { code: '1.6.3', name: 'Prepare Shareholder Reporting & Manage Investor Relations', question: 'How is shareholder reporting prepared?', options: ['Structured investor relations process with Board review', 'Finance and IR team collaboration', 'Finance-led preparation with ad-hoc IR input', 'Minimal formal shareholder reporting', 'No formal process'], painPoint: 'What challenges exist in preparing shareholder communications?' },
      { code: '1.6.4', name: 'Prepare Regulatory Reporting', question: 'How is regulatory reporting prepared and submitted?', options: ['Automated regulatory reporting solution', 'Dedicated compliance team with structured process', 'Finance team manual preparation', 'Inconsistent across regulatory requirements', 'No formal regulatory reporting process'], painPoint: 'What causes regulatory reporting errors or compliance risks?' },
      { code: '1.6.5', name: 'Prepare Financial Management Reporting', question: 'How is financial management reporting prepared?', options: ['Automated from BI/analytics platform', 'Structured reporting pack with defined templates', 'Manual preparation each period', 'Ad-hoc reporting on request', 'No formal management reporting process'], painPoint: 'What makes management reporting time-consuming or unreliable?' },
    ],
    toolQuestion: 'What tools support your period end reporting process?',
    toolOptions: ['Dedicated reporting platform', 'BI/analytics tool', 'ERP standard reports', 'Spreadsheet-based'],
  },
  {
    code: '1.7',
    name: 'Management Reporting & Commentary',
    description: 'Produce insightful management accounts and CFO commentary.',
    l3s: [
      { code: '1.7.1', name: 'Prepare Management Accounts Pack', question: 'How is the management accounts pack prepared?', options: ['Automated population from data warehouse/BI', 'Structured preparation with defined templates', 'Manual compilation each period', 'Ad-hoc preparation based on requests', 'No formal management accounts process'], painPoint: 'What makes management accounts preparation time-consuming?' },
      { code: '1.7.2', name: 'Write CFO Commentary & Narrative', question: 'How is the CFO commentary produced?', options: ['AI-assisted narrative generation', 'Structured template with Finance input', 'CFO writes with Finance support', 'Ad-hoc narrative without structure', 'No formal commentary process'], painPoint: 'What makes producing insightful CFO commentary difficult?' },
      { code: '1.7.3', name: 'Distribute Reports to Stakeholders', question: 'How are reports distributed to stakeholders?', options: ['Automated distribution via reporting platform', 'Scheduled email distribution with version control', 'Manual distribution to stakeholders', 'Ad-hoc distribution on request', 'No formal distribution process'], painPoint: 'What causes report distribution delays or version control issues?' },
      { code: '1.7.4', name: 'Gather Management Feedback & Actions', question: 'How is management feedback on reports gathered?', options: ['Structured feedback process with action tracking', 'Regular review meetings with action log', 'Informal feedback collection', 'Minimal feedback gathered', 'No formal feedback process'], painPoint: 'What prevents effective management engagement with financial reports?' },
    ],
    toolQuestion: 'What tools support your management reporting and commentary process?',
    toolOptions: ['BI/analytics platform', 'Reporting automation tool', 'Presentation software', 'Spreadsheet-based'],
  },
  {
    code: '1.8',
    name: 'Technical Accounting',
    description: 'Interpret accounting standards and maintain accounting policies.',
    l3s: [
      { code: '1.8.1', name: 'Understand & Interpret New Accounting Pronouncements', question: 'How are new accounting standards interpreted and adopted?', options: ['Dedicated technical accounting team with structured process', 'Finance team with external advisor support', 'Ad-hoc interpretation as standards are issued', 'Reactive interpretation when issues arise', 'No formal technical accounting process'], painPoint: 'What challenges exist in keeping up with accounting standard changes?' },
      { code: '1.8.2', name: 'Identify & Monitor Accounting Issues', question: 'How are accounting issues identified and monitored?', options: ['Proactive monitoring with issue tracking system', 'Regular technical accounting reviews', 'Ad-hoc identification when issues arise', 'Reactive response to audit findings', 'No formal issue monitoring process'], painPoint: 'What causes accounting issues to go undetected or unresolved?' },
      { code: '1.8.3', name: 'Maintain Disclosures', question: 'How are financial disclosures maintained and updated?', options: ['Automated disclosure management system', 'Structured disclosure checklist and review', 'Manual maintenance by accounting team', 'Ad-hoc updates as required', 'No formal disclosure management process'], painPoint: 'What causes disclosure errors or omissions?' },
      { code: '1.8.4', name: 'Maintain & Publish Accounting Policies', question: 'How are accounting policies maintained and communicated?', options: ['Central policy management system with version control', 'Finance team maintains with regular review cycle', 'Ad-hoc updates when needed', 'Policies exist but are rarely updated', 'No formal accounting policy management'], painPoint: 'What prevents accounting policies from being consistently applied?' },
    ],
    toolQuestion: 'What tools support your technical accounting process?',
    toolOptions: ['Dedicated technical accounting tool', 'Document management system', 'Shared drive/intranet', 'Manual/no formal tool'],
  },
  {
    code: '1.9',
    name: 'Manage Process',
    description: 'Govern and continuously improve the Record to Report process.',
    l3s: [
      { code: '1.9.1', name: 'Manage Close Process & Calendar', question: 'How is the close calendar managed?', options: ['Automated close management platform with task tracking', 'Centralised calendar with Finance ownership', 'Shared calendar with informal tracking', 'Informal close schedule', 'No formal close calendar'], painPoint: 'What causes the close calendar to slip?' },
      { code: '1.9.2', name: 'Maintain Policies, Procedures, Standards & Templates', question: 'How are R2R policies and procedures maintained?', options: ['Central repository with version control and review cycle', 'Finance team maintains and distributes', 'SharePoint/intranet based', 'Ad-hoc updates as needed', 'No formal policy management'], painPoint: 'What causes R2R policy inconsistencies across the organisation?' },
      { code: '1.9.3', name: 'Maintain Internal Controls', question: 'How are internal controls managed in R2R?', options: ['Integrated GRC platform with automated testing', 'Formal control framework with periodic testing', 'Audit-driven controls', 'Informal control checks', 'No formal control framework'], painPoint: 'What control weaknesses exist in your R2R process?' },
      { code: '1.9.4', name: 'Manage External Audit', question: 'How is the external audit managed?', options: ['Structured audit management with dedicated team', 'Finance team leads with clear ownership', 'Ad-hoc response to auditor requests', 'Reactive audit management', 'No formal audit management process'], painPoint: 'What causes external audit findings or delays?' },
      { code: '1.9.5', name: 'Manage Process Efficiency & Effectiveness', question: 'How is R2R process efficiency measured and improved?', options: ['KPIs tracked with continuous improvement programme', 'Regular process reviews with improvement actions', 'Ad-hoc improvement initiatives', 'Minimal measurement of process performance', 'No formal efficiency management'], painPoint: 'What prevents continuous improvement in your R2R process?' },
      { code: '1.9.6', name: 'Enhance Business Partner and Employee Experience', question: 'How is Finance business partnering delivered in R2R?', options: ['Dedicated business partnering model with SLAs', 'Finance team provides proactive support', 'Reactive support to business requests', 'Minimal business partnering', 'No formal business partnering in R2R'], painPoint: 'What prevents effective Finance business partnering in R2R?' },
      { code: '1.9.7', name: 'Archive & Maintain Records', question: 'How are R2R records archived and maintained?', options: ['Automated archiving with retention policies', 'Structured archive management process', 'Manual archiving by Finance team', 'Ad-hoc archiving', 'No formal record management'], painPoint: 'What challenges exist in maintaining R2R records and audit trails?' },
    ],
    toolQuestion: 'What tools support your R2R process management and governance?',
    toolOptions: ['Close management platform', 'GRC/controls tool', 'Document management system', 'Manual/spreadsheet-based'],
  },
  {
    code: '1.10',
    name: 'System Governance',
    description: 'Manage ERP and financial systems configuration, security and governance.',
    l3s: [
      { code: '1.10.1', name: 'Maintain Data Model', question: 'How is the financial data model maintained?', options: ['Formal MDM process with governance board', 'Finance and IT jointly manage', 'IT manages with Finance input', 'Ad-hoc changes as required', 'No formal data model governance'], painPoint: 'What causes data model inconsistencies or errors?' },
      { code: '1.10.2', name: 'Maintain Application Configuration & Security', question: 'How is ERP/system configuration and security managed?', options: ['Formal configuration management with change control', 'IT manages with Finance oversight', 'IT manages independently', 'Ad-hoc configuration changes', 'No formal configuration management'], painPoint: 'What system configuration issues impact your R2R process?' },
      { code: '1.10.3', name: 'Manage Application Releases & Upgrades', question: 'How are system releases and upgrades managed?', options: ['Formal release management with testing protocols', 'IT-led with Finance UAT', 'Minimal testing before release', 'Reactive upgrade management', 'No formal release management'], painPoint: 'What causes system upgrade issues to impact R2R?' },
      { code: '1.10.4', name: 'Maintain Reports', question: 'How are standard financial reports maintained?', options: ['Centralised report catalogue with version control', 'Finance team maintains standard reports', 'IT manages report library', 'Ad-hoc report maintenance', 'No formal report management'], painPoint: 'What causes report maintenance issues or inconsistencies?' },
      { code: '1.10.5', name: 'Manage Interfaces', question: 'How are system interfaces and integrations managed?', options: ['Automated interface monitoring with alerting', 'IT team manages with Finance oversight', 'IT manages independently', 'Reactive interface management', 'No formal interface management'], painPoint: 'What causes interface failures to impact R2R?' },
      { code: '1.10.6', name: 'Maintain Process Automation & Digital Labor', question: 'How is process automation maintained in R2R?', options: ['Centre of excellence for automation with formal governance', 'IT and Finance jointly manage automation', 'Ad-hoc automation maintenance', 'Minimal automation in place', 'No formal automation programme'], painPoint: 'What prevents automation from being fully adopted in R2R?' },
    ],
    toolQuestion: 'What tools support your R2R system governance?',
    toolOptions: ['ERP with formal governance', 'Dedicated ITSM tool', 'Manual governance process', 'No formal system governance'],
  },
  {
    code: '1.11',
    name: 'AI & Intelligent Automation',
    description: 'Leverage AI and automation to enhance R2R efficiency and insight.',
    l3s: [
      { code: '1.11.1', name: 'AI-Assisted Journal Entry Processing', question: 'How is AI used in journal entry processing?', options: ['AI suggests and auto-posts routine journals', 'AI flags anomalies for review', 'Basic automation for recurring journals only', 'Exploring AI for journal processing', 'No AI in journal processing'], painPoint: 'What prevents greater automation of journal entry processing?' },
      { code: '1.11.2', name: 'Automated Reconciliations', question: 'How advanced is your reconciliation automation?', options: ['Fully automated with AI matching', 'High match rate with exception-only review', 'Partially automated key reconciliations', 'Basic automation for simple reconciliations', 'Largely manual reconciliations'], painPoint: 'What prevents full automation of reconciliation processes?' },
      { code: '1.11.3', name: 'Intelligent Close Management', question: 'How is intelligence applied to close management?', options: ['AI predicts close risks and optimises sequencing', 'Automated task tracking with smart alerts', 'Basic close tracking tool', 'Spreadsheet-based close tracking', 'No intelligent close management'], painPoint: 'What prevents a more intelligent and efficient close process?' },
      { code: '1.11.4', name: 'Predictive Reporting & Analytics', question: 'How advanced are your predictive reporting capabilities?', options: ['AI-driven predictive analytics and commentary', 'Advanced analytics with some predictive elements', 'Standard BI reporting with historical analysis', 'Basic reporting without analytics', 'No predictive capabilities'], painPoint: 'What prevents more advanced analytics in R2R reporting?' },
      { code: '1.11.5', name: 'AI-Powered Anomaly Detection', question: 'How is anomaly detection performed in R2R?', options: ['AI-powered continuous anomaly detection', 'Automated threshold-based alerting', 'Manual variance analysis', 'Ad-hoc anomaly identification', 'No formal anomaly detection'], painPoint: 'What prevents proactive anomaly detection in your R2R process?' },
    ],
    toolQuestion: 'What AI and automation tools are used in your R2R process?',
    toolOptions: ['Dedicated AI/ML platform', 'RPA tools', 'ERP automation features', 'No AI or automation in use'],
  },
  {
    code: '1.12',
    name: 'Continuous Improvement',
    description: 'Drive ongoing improvement and transformation of the R2R function.',
    l3s: [
      { code: '1.12.1', name: 'Process Performance Monitoring', question: 'How is R2R process performance monitored?', options: ['Real-time KPI dashboard with automated alerts', 'Regular KPI reporting with trend analysis', 'Periodic performance reviews', 'Ad-hoc performance measurement', 'No formal performance monitoring'], painPoint: 'What prevents effective performance monitoring of R2R?' },
      { code: '1.12.2', name: 'Benchmark & Maturity Assessment', question: 'How does your organisation benchmark R2R performance?', options: ['Regular external benchmarking with industry peers', 'Internal benchmarking across entities', 'Ad-hoc benchmarking when issues arise', 'Limited benchmarking activity', 'No formal benchmarking'], painPoint: 'What prevents meaningful benchmarking of R2R performance?' },
      { code: '1.12.3', name: 'Finance Transformation Roadmap', question: 'How is the R2R transformation roadmap managed?', options: ['Formal transformation programme with dedicated team', 'Finance leadership owns roadmap with regular reviews', 'Ad-hoc improvement initiatives without roadmap', 'Limited transformation planning', 'No formal transformation roadmap'], painPoint: 'What are the biggest barriers to R2R transformation in your organisation?' },
    ],
    toolQuestion: 'What tools support your R2R continuous improvement programme?',
    toolOptions: ['Dedicated process improvement tool', 'Project management platform', 'Spreadsheet-based tracking', 'No formal improvement programme'],
  },
]

type Answers = Record<string, { selected: string[]; other: string; painPoint: string }>
type ToolAnswers = Record<string, { selected: string[]; tools: string }>

export default function AssessmentR2RPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [initialStepSet, setInitialStepSet] = useState(false)
  const [answers, setAnswers] = useState<Answers>({})
  const [toolAnswers, setToolAnswers] = useState<ToolAnswers>({})
  const [effortData, setEffortData] = useState<Record<string, { headcount: number; roles: string[]; hoursPerCycle: number; comments: string }>>({})
  const [saving, setSaving] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [loadingResponses, setLoadingResponses] = useState(true)

  useEffect(() => {
    const loadExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingResponses(false); return }

      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('process_name', 'Record to Report')

      if (assessmentData && assessmentData.length > 0) {
        const loadedAnswers: Answers = {}
        const loadedToolAnswers: ToolAnswers = {}

        for (const row of assessmentData) {
          if (!row.l3_code) continue
          loadedAnswers[row.l3_code] = {
            selected: row.selected_options || [],
            other: row.other_text || '',
            painPoint: row.pain_point || ''
          }
        }

        for (const s of steps) {
          const anyRow = assessmentData.find(r => r.step_code === s.code)
          if (anyRow) {
            loadedToolAnswers[s.code] = {
              selected: anyRow.tool_options || [],
              tools: anyRow.tool_names || ''
            }
          }
        }

        setAnswers(loadedAnswers)
        setToolAnswers(loadedToolAnswers)

        const answeredSteps = steps.filter(s =>
          s.l3s.some(l3 => loadedAnswers[l3.code]?.selected?.length > 0)
        )
        if (answeredSteps.length > 0 && !initialStepSet) {
          setCurrentStep(0)
          setInitialStepSet(true)
        }
      }

      const { data: effortDbData } = await supabase
        .from('process_effort')
        .select('*')
        .eq('user_id', user.id)
        .eq('process_name', 'Record to Report')

      if (effortDbData) {
        const loadedEffort: Record<string, { headcount: number; roles: string[]; hoursPerCycle: number; comments: string }> = {}
        for (const row of effortDbData) {
          if (row.step_code === 'roi_settings') continue
          loadedEffort[row.step_code] = {
            headcount: row.headcount || 0,
            roles: row.roles || [],
            hoursPerCycle: row.hours_per_cycle || 0,
            comments: row.comments || ''
          }
        }
        setEffortData(loadedEffort)
      }

      setLoadingResponses(false)
    }
    loadExisting()
  }, [])

  const step = steps[currentStep]
  const totalAnswered = step.l3s.filter(l3 => answers[l3.code]?.selected?.length > 0).length

  if (loadingResponses) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading your previous responses...</div>
      </div>
    </div>
  )

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

  const saveToSupabase = async (complete: boolean) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const rows = []
    for (const s of steps) {
      for (const l3 of s.l3s) {
        const ans = answers[l3.code]
        const toolAns = toolAnswers[s.code]
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
          process_name: 'Record to Report',
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
          process_name: 'Record to Report',
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
    if (complete) router.push('/results-r2r')
  }
const handleExportExcel = () => {
    const responseRows: string[][] = [['Step Code', 'Step Name', 'L3 Code', 'L3 Name', 'Selected Options', 'Other', 'Pain Point', 'Score']]
    for (const s of steps) {
      for (const l3 of s.l3s) {
        const ans = answers[l3.code]
        let score = 0
        if (ans?.selected?.length > 0) {
          const maxScore = Math.max(...(ans.selected.filter(o => o !== 'Other').map(o => {
            const idx = l3.options.indexOf(o)
            if (idx === -1) return 1
            return Math.max(1, 5 - idx)
          })))
          score = maxScore
        }
        responseRows.push([s.code, s.name, l3.code, l3.name, (ans?.selected || []).join('; '), ans?.other || '', ans?.painPoint || '', score.toString()])
      }
      const toolAns = toolAnswers[s.code]
      if (toolAns) {
        responseRows.push([s.code, s.name, 'TOOL', 'Tool Usage', (toolAns.selected || []).join('; '), toolAns.tools || '', '', ''])
      }
    }

    const effortRows: string[][] = [['Step Code', 'Step Name', 'Headcount', 'Hours/Cycle', 'Roles', 'Comments']]
    for (const s of steps) {
      const e = effortData[s.code]
      if (e) {
        effortRows.push([s.code, s.name, (e.headcount || 0).toString(), (e.hoursPerCycle || 0).toString(), (e.roles || []).join('; '), e.comments || ''])
      }
    }

    const toCSV = (rows: string[][]) => rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const sheet1 = 'RESPONSES\n' + toCSV(responseRows)
    const sheet2 = '\n\nEFFORT & ROI\n' + toCSV(effortRows)
    const blob = new Blob([sheet1 + sheet2], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'record-to-report-responses.csv'
    a.click()
    URL.revokeObjectURL(url)
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
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Record to Report</p>
        {steps.map((s, i) => (
          <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: i === currentStep && !showReview ? 1 : 0.5 }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: i < currentStep || showReview ? '#1d9e75' : i === currentStep ? 'white' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: i === currentStep && !showReview ? '#0F4C81' : 'white', flexShrink: 0 }}>
              {i < currentStep || showReview ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '11px', color: i === currentStep && !showReview ? 'white' : '#a0c4e8', fontWeight: i === currentStep && !showReview ? '600' : '400' }}>{s.name}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: showReview ? 1 : 0.5 }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: showReview ? 'white' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: showReview ? '#0F4C81' : 'white', flexShrink: 0 }}>
            {steps.length + 1}
          </div>
          <span style={{ fontSize: '11px', color: showReview ? 'white' : '#a0c4e8', fontWeight: showReview ? '600' : '400' }}>Review & Complete</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '4px', background: '#e0e4ea' }}>
          <div style={{ height: '100%', background: '#1d9e75', width: showReview ? '100%' : `${((currentStep + 1) / steps.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {showReview ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#f4f6f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>Review Your Responses</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>Check your answers before completing. Click Edit on any step to make changes.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleExportExcel} style={{ padding: '10px 20px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>⬇ Export to Excel</button>
                <button onClick={() => saveToSupabase(true)} disabled={saving} style={{ padding: '10px 24px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{saving ? 'Saving...' : '✓ Complete Assessment'}</button>
              </div>
            </div>

            {steps.map((s, si) => (
              <div key={s.code} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#4fa3e0', fontWeight: '700', marginBottom: '4px' }}>Step {si + 1}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>{s.code} {s.name}</div>
                  </div>
                  <button onClick={() => { setShowReview(false); setCurrentStep(si) }} style={{ padding: '7px 16px', background: '#f4f6f9', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>✏️ Edit Step</button>
                </div>

                {s.l3s.map(l3 => {
                  const ans = answers[l3.code]
                  return (
                    <div key={l3.code} style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#0F4C81', marginBottom: '4px' }}>{l3.code} {l3.name}</div>
                      <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                        {ans?.selected?.length > 0 ? ans.selected.join(', ') : <span style={{ color: '#999', fontStyle: 'italic' }}>No response</span>}
                      </div>
                      {ans?.painPoint && <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>Pain point: {ans.painPoint}</div>}
                    </div>
                  )
                })}

                {toolAnswers[s.code] && (
                  <div style={{ marginTop: '12px', background: '#f9f9f9', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Tool Usage</div>
                    <div style={{ fontSize: '13px', color: '#333' }}>{toolAnswers[s.code]?.selected?.join(', ') || '-'}</div>
                    {toolAnswers[s.code]?.tools && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Tools: {toolAnswers[s.code].tools}</div>}
                  </div>
                )}

                {effortData[s.code] && (
                  <div style={{ marginTop: '12px', background: '#f0f7ff', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#0F4C81', marginBottom: '4px' }}>👥 Team & Effort</div>
                    <div style={{ fontSize: '13px', color: '#333' }}>People: {effortData[s.code]?.headcount || '-'} · Hours/cycle: {effortData[s.code]?.hoursPerCycle || '-'}</div>
                    {effortData[s.code]?.roles?.length > 0 && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Roles: {effortData[s.code].roles.join(', ')}</div>}
                    {effortData[s.code]?.comments && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Comments: {effortData[s.code].comments}</div>}
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button onClick={() => setShowReview(false)} style={{ padding: '10px 20px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>← Back to Assessment</button>
              <button onClick={() => saveToSupabase(true)} disabled={saving} style={{ padding: '10px 24px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{saving ? 'Saving...' : '✓ Complete Assessment'}</button>
            </div>
          </div>
        ) : (
          <>
          <div style={{ padding: '24px 32px 16px', background: 'white', borderBottom: '1px solid #e0e4ea' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
            Dashboard → Process Explorer → Record to Report → {step.code} {step.name}
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
              <input type="text" placeholder="e.g. SAP, Oracle, Blackline, HFM, Tagetik..." value={toolAnswers[step.code]?.tools || ''} onChange={e => updateTools(step.code, e.target.value)} style={inputStyle} />
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>This helps us assess your R2R maturity and recommend the right tool overlays.</div>
            </div>

            {/* Effort Questions */}
            <div style={{ marginTop: '24px', padding: '20px', background: '#f0f7ff', borderRadius: '10px', border: '1px solid #d0e8ff' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F4C81', marginBottom: '16px' }}>👥 Team & Effort</div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>How many people are involved in this step?</div>
                <input type="number" min="0" placeholder="e.g. 3" value={effortData[step.code]?.headcount || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: parseInt(e.target.value) || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: prev[step.code]?.hoursPerCycle || 0, comments: prev[step.code]?.comments || '' } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '120px', color: '#333', background: 'white' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>What roles are involved? (select all that apply)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {['CFO / Finance Director', 'Financial Controller', 'FP&A Manager / Analyst', 'Management Accountant', 'Financial Accountant', 'Accounts Payable / Receivable', 'Treasury Analyst', 'Tax Manager', 'Business Partner', 'Operations Manager', 'Department Budget Holder', 'ERP/Systems Administrator', 'IT Manager', 'Data Analyst / BI Developer', 'External Auditor', 'Outsourced Provider'].map(role => (
                    <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={effortData[step.code]?.roles?.includes(role) || false} onChange={() => {
                        const current = effortData[step.code]?.roles || []
                        const updated = current.includes(role) ? current.filter(r => r !== role) : [...current, role]
                        setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: updated, hoursPerCycle: prev[step.code]?.hoursPerCycle || 0, comments: prev[step.code]?.comments || '' } }))
                      }} style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '12px', color: '#333' }}>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>How many hours per close cycle does the team spend on this step?</div>
                <input type="number" min="0" placeholder="e.g. 40" value={effortData[step.code]?.hoursPerCycle || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: parseInt(e.target.value) || 0, comments: prev[step.code]?.comments || '' } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '120px', color: '#333', background: 'white' }} />
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Any additional comments about this step's team or effort?</div>
                <textarea placeholder="e.g. This step involves the external audit team during year-end..." value={effortData[step.code]?.comments || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: prev[step.code]?.hoursPerCycle || 0, comments: e.target.value } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '100%', minHeight: '80px', resize: 'vertical', color: '#333', background: 'white' }} />
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
            <button onClick={() => saveToSupabase(false).then(() => router.push('/dashboard'))} disabled={saving} style={{ padding: '10px 20px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save & Exit'}
            </button>
            <button onClick={() => saveToSupabase(false)} disabled={saving} style={{ padding: '10px 20px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save Progress'}
            </button>
            {currentStep < steps.length - 1 ? (
              <button onClick={() => setCurrentStep(currentStep + 1)} style={{ padding: '10px 24px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Next: {steps[currentStep + 1].name} →
              </button>
            ) : (
              <button onClick={() => saveToSupabase(false).then(() => setShowReview(true))} disabled={saving} style={{ padding: '10px 24px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Review & Complete →'}
              </button>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}