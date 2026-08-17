'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const taxonomy: Record<string, { columns: { groupName: string; code: string; name: string; activities: string[] }[] }> = {
  'Plan to Perform': {
    columns: [
      { groupName: 'Define Strategy & Set Targets', code: '1.1', name: 'Develop Top-down Plan', activities: ['Perform Strategic Analysis', 'Articulate Stakeholder Expectations', 'Develop Strategic Objectives & Drivers', 'Define Strategic Initiatives & KPIs', 'Develop What-If Scenarios', 'Derive Top-down Model & Set Targets', 'Run Simulations & Finalise Plan', 'Gain Strategy Committee Approval'] },
      { groupName: 'Define Strategy & Set Targets', code: '1.2', name: 'Cascade the Plan', activities: ['Translate Top-down Plan to Divisional Plan', 'Define Planning Drivers and Assumptions', 'Establish Accountability & Review Mechanisms', 'Communicate Strategic Targets & Guidelines', 'Monitor Initial Plan Submissions & Feedback'] },
      { groupName: 'Plan the Business', code: '1.3', name: 'Develop Bottom-up Budget', activities: ['Develop Revenue Plan', 'Develop Direct Cost Plan', 'Develop Workforce Plan', 'Develop Capex and Project Plan', 'Develop Operating Expense (Opex) Plan', 'Consolidate Bottom-up Budget', 'Perform Gap Analysis vs Top-down Targets', 'Final Budget Review and Sign-off'] },
      { groupName: 'Plan the Business', code: '1.4', name: 'Refresh Rolling Forecasts', activities: ['Seed Forecast', 'Refresh Revenue Forecast', 'Refresh Direct Cost', 'Refresh Workforce Forecast', 'Refresh Project & Capex', 'Refresh Opex Forecast', 'Consolidate Forecasts Across Functions', 'Perform Scenario Testing'] },
      { groupName: 'Report the Results', code: '1.5', name: 'Report Results', activities: ['Process Management Allocations', 'Run Variance Analytics', 'Define Reporting Frequency', 'Standardise Management Reporting'] },
      { groupName: 'Address the Gaps', code: '1.6', name: 'Take Corrective Actions', activities: ['Identify Root Causes for Performance Gaps', 'Define and Document Corrective Action Plans', 'Assign Actions to Owners & Deadlines', 'Track and Monitor Corrective Action Progress', 'Reforecast Based on Corrective Measures', 'Evaluate Effectiveness & Close Loop'] },
      { groupName: 'Govern & Enable', code: '1.7', name: 'Govern the Process', activities: ['Manage FP&A Planning & Reporting Calendar', 'Manage Policies, Standards & Templates', 'Manage Data & Master Data', 'Manage Planning & Reporting Systems (EPM)', 'Manage Internal Controls', 'Process Automation & Digital Tools', 'Govern AI', 'Ensure FP&A Team Capability Development', 'Archive & Maintain Records'] },
    ]
  },
  'Project to Result': {
    columns: [
      { groupName: 'Plan & Approve', code: '1.1', name: 'Project & Portfolio Planning', activities: ['Review & align capital plan with enterprise strategy', 'Run predictive analytics for project portfolio', 'Define & maintain portfolio of capital programmes', 'Determine Opex project plans & budgets', 'Prioritise & rank project portfolio', 'Model scenarios & assess portfolio risk'] },
      { groupName: 'Plan & Approve', code: '1.2', name: 'Project Creation & Approval', activities: ['Define project scope (Capital/Operating/Agile)', 'Create project structure & define accounting (WBS, planned assets)', 'Assign project budget & timeline', 'Define delivery methodology (waterfall, agile, hybrid)', 'Obtain project approval & governance sign-off', 'Communicate project authorisation to stakeholders'] },
      { groupName: 'Execute & Monitor', code: '1.3', name: 'Execute, Monitor & Control Project', activities: ['Execute project, capture & track costs', 'Capture & track commitments & purchase orders', 'Manage earned value (EVM) — planned vs actual vs earned', 'Generate progress reports & variance analysis', 'Record project adjustments & change orders', 'Revise project budget & forecast (EAC/ETC)', 'Manage project risks & issues', 'Monitor ESG & sustainability metrics on projects'] },
      { groupName: 'Contract & Compliance', code: '1.4', name: 'Contract & Compliance Management', activities: ['Manage contract types (fixed price, cost-plus, milestone)', 'Manage government & defence contract compliance', 'Manage export control & regulatory compliance', 'Manage contract amendments & variations', 'Manage claims & dispute resolution'] },
      { groupName: 'Bill & Revenue', code: '1.5', name: 'Manage Project Billing & Revenue', activities: ['Manage project billing — third party billing', 'Manage project billing — intercompany billing', 'Manage project revenue recognition (IFRS 15 / ASC 606)', 'Manage project profitability & margin reporting', 'Manage WIP, deferred & unbilled revenue'] },
      { groupName: 'Capitalise & Close', code: '1.6', name: 'Capitalise & Close Project', activities: ['Capitalise project expenses including interest (AUC)', 'Manage asset under construction (AUC) to asset transfer', 'Finalise accounting & close project', 'Conduct post-project review & lessons learned', 'Capture & transfer knowledge to operations'] },
      { groupName: 'Connected Planning', code: '1.7', name: 'Connected Planning & FP&A Integration', activities: ['Integrate project spend into rolling forecast', 'Link project cashflow to treasury & working capital', 'Report project portfolio impact on P&L and balance sheet', 'Manage benefits realisation tracking', 'Align project investment to strategic objectives'] },
      { groupName: 'Period End', code: '1.8', name: 'Period End Close, Reporting & Analytics', activities: ['Close PA sub-ledger & reconcile with GL', 'Prepare project accruals & cut-off journals', 'Prepare project portfolio reporting & analytics', 'Report project profitability & ROI', 'Prepare ESG & sustainability project reporting'] },
      { groupName: 'AI & Automation', code: '1.9', name: 'AI & Intelligent Automation', activities: ['AI-assisted project cost forecasting & EAC prediction', 'Automated project risk identification & early warning', 'Intelligent resource allocation optimisation', 'Automated capitalisation & asset creation', 'Digital twin & real-time project intelligence', 'Generative AI for project reporting & commentary'] },
      { groupName: 'Govern & Enable', code: '1.10', name: 'Manage Process', activities: ['Maintain policies, procedures & templates', 'Maintain internal controls & audit trail', 'Manage process efficiency & effectiveness', 'Enhance business partner & employee experience', 'Manage training & capability development', 'Archive & maintain records'] },
      { groupName: 'Govern & Enable', code: '1.11', name: 'System Governance', activities: ['Maintain project master data & hierarchies', 'Maintain application configuration & security', 'Manage application releases & upgrades', 'Maintain reports & analytics layer', 'Manage system interfaces & integrations', 'Maintain process automation & digital labour'] },
    ]
  },
  'Procure to Pay': {
    columns: [
      { groupName: 'Manage Suppliers', code: '1.1', name: 'Supplier Management', activities: ['Supplier Onboarding & Qualification', 'Supplier Master Data Management', 'Supplier Performance Monitoring', 'Supplier Relationship Management', 'Supplier Risk Assessment'] },
      { groupName: 'Request & Order', code: '1.2', name: 'Requisitioning', activities: ['Purchase Requisition Creation', 'Requisition Approval & Budget Validation', 'Catalogue & Self-Service Procurement', 'Requisition Compliance & Policy Checking', 'Requisition Lifecycle Management'] },
      { groupName: 'Request & Order', code: '1.3', name: 'Purchasing', activities: ['Purchase Order Creation & Issuance', 'PO Approval & Compliance', 'PO Amendments & Cancellations', 'Supplier Order Confirmation', 'PO Lifecycle Tracking & Expediting'] },
      { groupName: 'Receive Goods & Services', code: '1.4', name: 'Receiving', activities: ['Goods Receipt Processing', 'Service Confirmation & Acceptance', 'Returns & Rejections Management', 'Discrepancy Identification & Resolution', 'GRNI Recording & Management'] },
      { groupName: 'Process Invoices & Pay', code: '1.5', name: 'Invoice Processing & Payment', activities: ['Invoice Receipt & Capture', 'Three-Way Matching (PO, GR, Invoice)', 'Invoice Exception Handling', 'Invoice Approval & Posting', 'Payment Run Management', 'Prepayments & Advance Billing Management'] },
      { groupName: 'Process Invoices & Pay', code: '1.6', name: 'Cash & Payment Management', activities: ['Payment Terms Strategy & Management', 'Early Payment & Dynamic Discounting', 'Foreign Currency & Cross-Border Payments', 'Bank Account & Payment Method Management', 'Cash Flow Forecasting for Payables'] },
      { groupName: 'Manage Cards & Expenses', code: '1.7', name: 'P-Card & T&E Administration', activities: ['P-Card & T&E Card Issuance & Management', 'Expense Submission & Policy Compliance', 'Expense Approval & Workflow', 'Card Transaction Reconciliation', 'T&E Reporting & Analytics'] },
      { groupName: 'Handle Queries', code: '1.8', name: 'Purchasing/Payment Inquiries', activities: ['Supplier Payment Status Inquiries', 'Invoice Dispute Management', 'Internal Procurement Query Management', 'Overpayment & Duplicate Payment Resolution'] },
      { groupName: 'Control & Comply', code: '1.9', name: 'Compliance & Controls', activities: ['Segregation of Duties Management', 'Fraud Detection & Prevention', 'Audit Trail & Documentation Management', 'Regulatory & Tax Compliance', 'Internal Controls Testing & Monitoring'] },
      { groupName: 'Control & Comply', code: '1.10', name: 'Period End Close', activities: ['AP Accruals & Cut-off Management', 'GRNI Reconciliation & Clearance', 'AP Sub-Ledger to GL Reconciliation', 'Prepaid Expense Amortisation', 'Period End AP Reporting'] },
      { groupName: 'Govern & Enable', code: '1.11', name: 'Reporting & Analytics', activities: ['Spend Analytics & Category Reporting', 'AP & Payment Performance Reporting', 'Process Efficiency & Touchless Rate Reporting', 'Supplier Performance Reporting', 'Working Capital & DPO Reporting'] },
      { groupName: 'Govern & Enable', code: '1.12', name: 'Manage Process', activities: ['Process Ownership & Governance', 'Process Documentation & SOPs', 'Continuous Improvement & Lean Management', 'Training & Capability Development', 'Change Management & Adoption'] },
      { groupName: 'Govern & Enable', code: '1.13', name: 'System Governance', activities: ['ERP & Procurement System Management', 'Master Data Governance', 'System Access & Security Management', 'Automation & AI Tool Governance', 'Digital & Technology Roadmap Management'] },
    ]
  },
  'Record to Report': {
    columns: [
      { groupName: 'Sub Ledgers', code: '1.1', name: 'Close General Ledger Data Sources', activities: ['Close & Transfer General Ledger Data Sources', 'Reconcile General Ledger Data Sources', 'Perform Intercompany Reconciliations'] },
      { groupName: 'General Ledger', code: '1.2', name: 'Pre-Close Activities', activities: ['Record Journal Entries', 'Process General Ledger Allocations', 'Record Statutory Journal Entries', 'Perform GL Foreign Currency Accounting', 'Process Local Tax Calculations & Journal Entries', 'Perform Journal Review Checks'] },
      { groupName: 'General Ledger', code: '1.3', name: 'Preliminary Financial Reviews & GL Close', activities: ['Review Trial Balance', 'Review Preliminary Financial Statements', 'Record Management & Corporate Adjustments', 'Close General Ledger', 'Manage and Perform Period End Reconciliations'] },
      { groupName: 'General Ledger', code: '1.4', name: 'Intercompany Accounting & Eliminations', activities: ['Process Intercompany Transactions', 'Perform Intercompany Matching & Reconciliation', 'Resolve Intercompany Disputes', 'Process Intercompany Eliminations'] },
      { groupName: 'Financial Consolidation', code: '1.5', name: 'Financial Consolidation', activities: ['Preliminary Consolidation Processes & Checks', 'Process Currency Translations', 'Process Intercompany Eliminations', 'Process Consolidation Adjustments', 'Process Tax Calculations & Consolidated Tax Journal Entries', 'Close Corporate Consolidation Ledger'] },
      { groupName: 'Period End Reporting', code: '1.6', name: 'Period End Reporting', activities: ['Prepare External Reporting & Notes to the Financials', 'Prepare Statutory Filings & Reporting', 'Prepare Shareholder Reporting & Manage Investor Relations', 'Prepare Regulatory Reporting', 'Prepare Financial Management Reporting'] },
      { groupName: 'Period End Reporting', code: '1.7', name: 'Management Reporting & Commentary', activities: ['Prepare Management Accounts Pack', 'Write CFO Commentary & Narrative', 'Distribute Reports to Stakeholders', 'Gather Management Feedback & Actions'] },
      { groupName: 'Process Governance', code: '1.8', name: 'Technical Accounting', activities: ['Understand & Interpret New Accounting Pronouncements', 'Identify & Monitor Accounting Issues', 'Maintain Disclosures', 'Maintain & Publish Accounting Policies'] },
      { groupName: 'Process Governance', code: '1.9', name: 'Manage Process', activities: ['Manage Close Process & Calendar', 'Maintain Policies, Procedures, Standards & Templates', 'Maintain Internal Controls', 'Manage External Audit', 'Manage Process Efficiency & Effectiveness', 'Enhance Business Partner and Employee Experience', 'Archive & Maintain Records'] },
      { groupName: 'Process Governance', code: '1.10', name: 'System Governance', activities: ['Maintain Data Model', 'Maintain Application Configuration & Security', 'Manage Application Releases & Upgrades', 'Maintain Reports', 'Manage Interfaces', 'Maintain Process Automation & Digital Labor'] },
      { groupName: 'AI & Intelligent Automation', code: '1.11', name: 'AI & Intelligent Automation', activities: ['AI-Assisted Journal Entry Processing', 'Automated Reconciliations', 'Intelligent Close Management', 'Predictive Reporting & Analytics', 'AI-Powered Anomaly Detection'] },
      { groupName: 'Continuous Improvement', code: '1.12', name: 'Continuous Improvement', activities: ['Process Performance Monitoring', 'Benchmark & Maturity Assessment', 'Finance Transformation Roadmap'] },
    ]
  }
}

const comingSoon = ['Quote to Cash', 'Source to Procure', 'Acquire to Retire', 'Transact to Record']

const groupColors: Record<string, string> = {
  'Define Strategy & Set Targets': '#0F2744',
  'Plan the Business': '#1a4a7a',
  'Report the Results': '#1a5276',
  'Address the Gaps': '#154360',
  'Govern & Enable': '#1b2631',
  'Sub Ledgers': '#0F2744',
  'General Ledger': '#1a4a7a',
  'Financial Consolidation': '#1a5276',
  'Period End Reporting': '#154360',
  'Process Governance': '#1b2631',
  'AI & Intelligent Automation': '#6b21a8',
  'Continuous Improvement': '#065f46',
  'Plan & Approve': '#0F2744',
  'Execute & Monitor': '#1a4a7a',
  'Contract & Compliance': '#6b21a8',
  'Bill & Revenue': '#1a5276',
  'Capitalise & Close': '#154360',
  'Connected Planning': '#065f46',
  'Period End': '#1b2631',
  'AI & Automation': '#3730a3',
  'Manage Suppliers': '#0F2744',
  'Request & Order': '#1a4a7a',
  'Receive Goods & Services': '#1a5276',
  'Process Invoices & Pay': '#154360',
  'Manage Cards & Expenses': '#0e6655',
  'Handle Queries': '#1b2631',
  'Control & Comply': '#6b21a8',
}

export default function ProcessExplorer() {
  const router = useRouter()
  const [selected, setSelected] = useState('Plan to Perform')
  const [industry, setIndustry] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth <= 768)
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.industry) setIndustry(user.user_metadata.industry)
    }
    getUser()
  }, [])

  const current = taxonomy[selected]
  const totalActivities = current.columns.reduce((sum, c) => sum + c.activities.length, 0)

  const groups = current.columns.reduce((acc, col) => {
    if (!acc[col.groupName]) acc[col.groupName] = []
    acc[col.groupName].push(col)
    return acc
  }, {} as Record<string, typeof current.columns>)

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .pe-sidebar { transform: translateX(-100%); position: fixed !important; z-index: 200; height: 100vh; transition: transform 0.3s; overflow-y: auto; }
        .pe-sidebar.open { transform: translateX(0); }
        .pe-topbar { display: flex !important; }
        .pe-main { padding: 16px !important; }
        .pe-columns { flex-direction: column !important; overflow-x: visible !important; }
        .pe-column { min-width: 100% !important; width: 100% !important; }
      }
      @media (min-width: 769px) {
        .pe-topbar { display: none !important; }
      }
    `}</style>
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />}
      {/* Sidebar */}
      <div className={`pe-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width: '240px', background: '#0F4C81', color: 'white', padding: '24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>FPI</div>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Finance Process</span>
        </div>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '32px', marginLeft: '46px' }}>Intelligence Platform</p>
        {['Dashboard', 'My Assessments', 'Process Explorer', 'Reports', 'Settings', 'Sign Out'].map(item => (
          <div key={item} onClick={async () => {
            if (item === 'Dashboard') router.push('/dashboard')
            if (item === 'My Assessments') router.push('/my-assessments')
            if (item === 'Reports') router.push('/reports')
            if (item === 'Settings') router.push('/settings')
            if (item === 'Sign Out') { await supabase.auth.signOut(); router.push('/') }
          }} style={{ padding: '10px 12px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', background: item === 'Process Explorer' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="pe-main" style={{ flex: 1, background: '#f4f6f9', padding: '24px', overflowX: 'auto', display: 'flex', flexDirection: 'column' }}>
  <div className="pe-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0F4C81', borderRadius: '8px', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '30px', height: '30px', background: '#4fa3e0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'white' }}>FPI</div>
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Process Explorer</span>
    </div>
    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>☰</button>
  </div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e' }}>Finance Process Taxonomy</h1>
            <p style={{ color: '#666', marginTop: '4px', fontSize: '13px' }}>Select a domain to view all L2 and L3 activities</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {industry && (
              <span style={{ padding: '6px 14px', background: '#e8f4fd', color: '#0F4C81', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #b8d9f5' }}>
                🏢 {industry}
              </span>
            )}
            <select value={selected} onChange={e => setSelected(e.target.value)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', background: 'white', fontWeight: '600', cursor: 'pointer' }}>
              {Object.keys(taxonomy).map(p => <option key={p}>{p}</option>)}
              {comingSoon.map(p => <option key={p} disabled>🔒 {p}</option>)}
            </select>
            <span style={{ fontSize: '13px', color: '#666', background: 'white', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' }}>{current.columns.length} L2s &nbsp;|&nbsp; {totalActivities} L3s</span>
          </div>
        </div>

        {/* Column Table */}
        <div className="pe-columns" style={{ display: 'flex', gap: '0', flexShrink: 0 }}>
          {Object.entries(groups).map(([groupName, cols]) => (
            <div key={groupName} className="pe-group" style={{ display: 'flex', flexDirection: 'column', flex: cols.length }}>
              <div style={{ background: groupColors[groupName] || '#0F2744', color: 'white', padding: '10px 14px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                {groupName}
              </div>
              <div style={{ display: 'flex', flex: 1 }}>
                {cols.map(col => (
                  <div key={col.code} style={{ flex: 1, background: 'white', borderRight: '1px solid #e0e4ea', borderBottom: '1px solid #e0e4ea', padding: '12px', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ background: '#4fa3e0', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}>{col.code}</span>
                      <span style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '12px', lineHeight: '1.3' }}>{col.name}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{col.activities.length} L3 activities</div>
                    {col.activities.map((activity, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <span style={{ fontSize: '11px', color: '#444', flex: 1, lineHeight: '1.3' }}>
                          <span style={{ color: '#4fa3e0', fontWeight: '600', marginRight: '4px' }}>{col.code}.{i + 1}</span>
                          {activity}
                        </span>
                        <button onClick={() => router.push(selected === 'Record to Report' ? '/assessment-r2r' : selected === 'Procure to Pay' ? `/assessment-ptp?code=${col.code}` : selected === 'Project to Result' ? `/assessment-p2r?code=${col.code}` : `/assessment?code=${col.code}`)} style={{ padding: '2px 7px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginLeft: '4px', flexShrink: 0 }}>Assess</button>
                      </div>
                    ))}
                    <button onClick={() => router.push(selected === 'Record to Report' ? `/assessment-r2r?code=${col.code}` : selected === 'Procure to Pay' ? `/assessment-ptp?code=${col.code}` : `/assessment?code=${col.code}`)} style={{ width: '100%', marginTop: '10px', padding: '6px', background: '#0F2744', color: 'white', border: 'none', borderRadius: '5px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      Assess All →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '14px 16px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', flexShrink: 0 }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Viewing: <strong style={{ color: '#1a1a2e' }}>{selected}</strong></span>
          <button onClick={() => router.push(selected === 'Record to Report' ? '/assessment-r2r' : selected === 'Procure to Pay' ? '/assessment-ptp' : selected === 'Project to Result' ? '/assessment-p2r' : '/assessment')} style={{ padding: '12px 28px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            Start Full Assessment →
          </button>
        </div>
      </div>
    </div>
     </>
  )
}