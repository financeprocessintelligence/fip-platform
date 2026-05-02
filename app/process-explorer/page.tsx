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

const comingSoon = ['Quote to Cash', 'Project to Result', 'Source to Pay', 'Acquire to Retire', 'Transact to Record']

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
}

export default function ProcessExplorer() {
  const router = useRouter()
  const [selected, setSelected] = useState('Plan to Perform')
  const [industry, setIndustry] = useState('')

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
            if (item === 'Reports') router.push('/reports')
          }} style={{ padding: '10px 12px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', background: item === 'Process Explorer' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#f4f6f9', padding: '24px', overflowX: 'auto', display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ display: 'flex', gap: '0', flexShrink: 0 }}>
          {Object.entries(groups).map(([groupName, cols]) => (
            <div key={groupName} style={{ display: 'flex', flexDirection: 'column', flex: cols.length }}>
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
                        <button onClick={() => router.push(selected === 'Record to Report' ? '/assessment-r2r' : `/assessment?code=${col.code.split('.')[0]}.${col.code.split('.')[1]}`)} style={{ padding: '2px 7px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginLeft: '4px', flexShrink: 0 }}>Assess</button>
                      </div>
                    ))}
                    <button onClick={() => router.push(selected === 'Record to Report' ? '/assessment-r2r' : `/assessment?code=${col.code.split('.')[0]}.${col.code.split('.')[1]}`)} style={{ width: '100%', marginTop: '10px', padding: '6px', background: '#0F2744', color: 'white', border: 'none', borderRadius: '5px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
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
          <button onClick={() => router.push(selected === 'Record to Report' ? '/assessment-r2r' : '/assessment')} style={{ padding: '12px 28px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            Start Full Assessment →
          </button>
        </div>
      </div>
    </div>
  )
}