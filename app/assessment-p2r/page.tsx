'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const steps = [
  {
    code: '1.1',
    name: 'Project & Portfolio Planning',
    description: 'Strategic planning, portfolio prioritisation and capital programme management.',
    l3s: [
      { code: '1.1.1', name: 'Review & align capital plan with enterprise strategy', question: 'How is the capital plan reviewed and aligned to enterprise strategy?', options: ['Formal annual capital planning process integrated with enterprise strategy', 'Finance-led capital review with executive sign-off', 'Capital plan developed independently by project teams', 'Ad-hoc capital requests assessed individually', 'No formal capital planning process'], painPoint: 'What prevents effective alignment between capital plans and enterprise strategy?' },
      { code: '1.1.2', name: 'Run predictive analytics for project portfolio', question: 'How is predictive analytics used across the project portfolio?', options: ['AI/ML models predicting portfolio performance and cashflow outcomes', 'Advanced BI analytics with scenario modelling', 'Standard portfolio reporting with trend analysis', 'Ad-hoc analysis using spreadsheets', 'No formal portfolio analytics'], painPoint: 'What data or capability gaps limit your portfolio analytics?' },
      { code: '1.1.3', name: 'Define & maintain portfolio of capital programmes', question: 'How is the portfolio of capital programmes defined and maintained?', options: ['Centralised portfolio management platform with real-time updates', 'Finance-led portfolio register with regular reviews', 'Project-by-project tracking without portfolio view', 'Informal list maintained by Finance', 'No formal portfolio management'], painPoint: 'What makes maintaining an accurate capital programme portfolio difficult?' },
      { code: '1.1.4', name: 'Determine Opex project plans & budgets', question: 'How are Opex project plans and budgets determined?', options: ['Driver-based Opex modelling linked to project plans', 'Finance and project teams co-own Opex budgets', 'Historical run-rate plus known changes', 'BU-led with Finance review', 'No formal Opex project budgeting'], painPoint: 'What causes Opex project budgets to be inaccurate?' },
      { code: '1.1.5', name: 'Prioritise & rank project portfolio', question: 'How are projects prioritised and ranked across the portfolio?', options: ['AI-assisted multi-criteria prioritisation with strategic scoring', 'Formal investment committee with defined criteria', 'Finance-led prioritisation based on ROI', 'Senior management judgement', 'No formal prioritisation process'], painPoint: 'What causes suboptimal project prioritisation decisions?' },
      { code: '1.1.6', name: 'Model scenarios & assess portfolio risk', question: 'How are portfolio scenarios modelled and risks assessed?', options: ['AI-driven what-if modelling across programme portfolio', 'Structured scenario planning with Monte Carlo simulation', 'Sensitivity analysis on key assumptions', 'Limited scenario modelling', 'No formal scenario modelling'], painPoint: 'What limits your ability to model portfolio scenarios effectively?' },
    ],
    toolQuestion: 'What tools support your project and portfolio planning?',
    toolOptions: ['Portfolio management platform (e.g. Planview, Oracle Primavera)', 'ERP project module', 'Excel/spreadsheet-based', 'Mix of tools'],
  },
  {
    code: '1.2',
    name: 'Project Creation & Approval',
    description: 'Project definition, structure, budget assignment and governance approval.',
    l3s: [
      { code: '1.2.1', name: 'Define project scope (Capital/Operating/Agile)', question: 'How is project scope defined and classified?', options: ['Formal scope definition with structured templates and classification framework', 'Standard project initiation document with Finance review', 'Informal scope definition by project manager', 'Ad-hoc scope setting', 'No formal scope definition process'], painPoint: 'What causes scope ambiguity or misclassification at project initiation?' },
      { code: '1.2.2', name: 'Create project structure & define accounting (WBS, planned assets)', question: 'How is the project accounting structure created?', options: ['Automated WBS creation from templates with system-enforced accounting rules', 'Finance and project teams jointly define WBS and cost centres', 'Standard WBS templates applied manually', 'Ad-hoc project structure created per project', 'No formal project accounting structure'], painPoint: 'What causes project accounting structures to be inconsistent or incorrect?' },
      { code: '1.2.3', name: 'Assign project budget & timeline', question: 'How are project budgets and timelines assigned?', options: ['AI benchmarking of budget estimates against similar completed projects', 'Formal bottom-up estimating with independent review', 'Finance-led budget setting with project input', 'Management judgement', 'No formal budget setting process'], painPoint: 'What causes project budgets to be inaccurate at initiation?' },
      { code: '1.2.4', name: 'Define delivery methodology (waterfall, agile, hybrid)', question: 'How is the project delivery methodology selected and defined?', options: ['Formal methodology selection framework aligned to project type', 'Standard methodology applied with tailoring', 'Project manager decides methodology informally', 'Single methodology applied to all projects regardless of type', 'No formal methodology definition'], painPoint: 'What prevents appropriate methodology selection for different project types?' },
      { code: '1.2.5', name: 'Obtain project approval & governance sign-off', question: 'How is project approval obtained?', options: ['Formal investment committee with stage-gate governance', 'CFO/Executive approval with business case review', 'Finance approval above threshold', 'Manager approval without formal business case', 'No formal approval process'], painPoint: 'What causes delays or poor decisions in the project approval process?' },
      { code: '1.2.6', name: 'Communicate project authorisation to stakeholders', question: 'How is project authorisation communicated to stakeholders?', options: ['Automated system notification with project code activation', 'Formal communication plan with defined stakeholders', 'Email notification from Finance/PMO', 'Informal verbal communication', 'No formal communication process'], painPoint: 'What causes confusion about project authorisation status?' },
    ],
    toolQuestion: 'What tools support project creation and approval?',
    toolOptions: ['ERP project creation module (SAP PS, Oracle Projects)', 'Project management tool (MS Project, Primavera)', 'Business case management tool', 'Excel/manual process'],
  },
  {
    code: '1.3',
    name: 'Execute, Monitor & Control Project',
    description: 'Project cost tracking, earned value management, progress reporting and risk management.',
    l3s: [
      { code: '1.3.1', name: 'Execute project, capture & track costs', question: 'How are project costs captured and tracked during execution?', options: ['AI automated cost capture with real-time coding and anomaly detection', 'ERP-integrated cost capture with automated posting', 'Regular manual cost entry by project teams', 'Period-end cost allocation by Finance', 'No formal cost tracking process'], painPoint: 'What causes project cost data to be inaccurate or delayed?' },
      { code: '1.3.2', name: 'Capture & track commitments & purchase orders', question: 'How are project commitments and purchase orders tracked?', options: ['Automated commitment tracking integrated with procurement system', 'ERP-based commitment reporting with Finance oversight', 'Manual tracking of POs and commitments', 'Commitments tracked only at period end', 'No formal commitment tracking'], painPoint: 'What causes commitments to be missed or incorrectly recorded?' },
      { code: '1.3.3', name: 'Manage earned value (EVM) — planned vs actual vs earned', question: 'How is earned value management applied to projects?', options: ['Fully automated EVM with real-time SPI/CPI dashboards', 'Structured EVM process with monthly reporting', 'Basic planned vs actual tracking without earned value', 'Informal progress tracking', 'EVM not applied'], painPoint: 'What prevents effective implementation of earned value management?' },
      { code: '1.3.4', name: 'Generate progress reports & variance analysis', question: 'How are project progress reports and variance analyses generated?', options: ['AI narrative generation for project variance reports', 'Automated reporting from project management system', 'Finance produces manual reports each period', 'Ad-hoc reports on request', 'No formal progress reporting'], painPoint: 'What makes project reporting time-consuming or unreliable?' },
      { code: '1.3.5', name: 'Record project adjustments & change orders', question: 'How are project adjustments and change orders managed?', options: ['Formal change control process with automated audit trail', 'Structured change management with Finance approval', 'Ad-hoc change orders with manual journal entries', 'Changes made without formal process', 'No formal change management'], painPoint: 'What causes project change orders to be poorly controlled?' },
      { code: '1.3.6', name: 'Revise project budget & forecast (EAC/ETC)', question: 'How is the project forecast revised during execution?', options: ['AI-predicted estimate at completion (EAC) based on burn rate and EVM', 'Structured reforecast process with project and Finance input', 'Periodic manual reforecast by project manager', 'Forecast revised only when significant variances arise', 'No formal reforecast process'], painPoint: 'What causes project forecasts to be inaccurate or delayed?' },
      { code: '1.3.7', name: 'Manage project risks & issues', question: 'How are project risks and issues identified and managed?', options: ['AI early warning signals detecting at-risk projects from data patterns', 'Formal risk register with regular review and escalation', 'Ad-hoc risk identification by project manager', 'Reactive risk management when issues arise', 'No formal risk management process'], painPoint: 'What causes project risks to go undetected or unmanaged?' },
      { code: '1.3.8', name: 'Monitor ESG & sustainability metrics on projects', question: 'How are ESG and sustainability metrics monitored on projects?', options: ['Automated ESG data capture with real-time carbon tracking', 'Structured ESG reporting integrated into project governance', 'Ad-hoc ESG reporting at project completion', 'ESG metrics collected but not actively managed', 'No ESG monitoring on projects'], painPoint: 'What prevents effective ESG monitoring across your project portfolio?' },
    ],
    toolQuestion: 'What tools support project execution and monitoring?',
    toolOptions: ['ERP project system (SAP PS, Oracle Projects)', 'Project management platform (MS Project, Primavera, Planview)', 'EVM software', 'Excel/manual'],
  },
  {
    code: '1.4',
    name: 'Contract & Compliance Management',
    description: 'Government and defence contract compliance, export control and claims management.',
    l3s: [
      { code: '1.4.1', name: 'Manage contract types (fixed price, cost-plus, milestone)', question: 'How are different contract types managed across your project portfolio?', options: ['Integrated contract management system with automated billing triggers', 'Finance team manages contract types with defined processes per type', 'Standard approach applied regardless of contract type', 'Ad-hoc management per contract', 'No formal contract type management'], painPoint: 'What challenges arise from managing multiple contract types simultaneously?' },
      { code: '1.4.2', name: 'Manage government & defence contract compliance', question: 'How is compliance with government and defence contract requirements managed?', options: ['AI compliance monitoring against contract terms with automated alerts', 'Dedicated compliance team with structured review process', 'Finance team monitors compliance manually', 'Reactive compliance management when issues arise', 'No formal compliance management process'], painPoint: 'What government or defence contract compliance risks concern you most?' },
      { code: '1.4.3', name: 'Manage export control & regulatory compliance', question: 'How is export control and regulatory compliance managed on projects?', options: ['Automated export control screening integrated into project workflow', 'Dedicated export control team with formal review process', 'Compliance checked manually at key project milestones', 'Ad-hoc compliance checking', 'No formal export control process'], painPoint: 'What export control or regulatory risks exist in your project portfolio?' },
      { code: '1.4.4', name: 'Manage contract amendments & variations', question: 'How are contract amendments and variations managed?', options: ['Formal change control integrated with contract management system', 'Structured amendment process with Finance and Legal review', 'Manual tracking of amendments via spreadsheet', 'Ad-hoc management per amendment', 'No formal amendment process'], painPoint: 'What causes contract amendments to be poorly controlled?' },
      { code: '1.4.5', name: 'Manage claims & dispute resolution', question: 'How are contract claims and disputes managed?', options: ['Structured claims management process with legal and Finance involvement', 'Finance-led claims tracking with external legal support', 'Ad-hoc claims management when disputes arise', 'Reactive approach with no formal process', 'No formal claims management'], painPoint: 'What causes contract disputes or claims to escalate?' },
    ],
    toolQuestion: 'What tools support contract and compliance management?',
    toolOptions: ['Contract lifecycle management (CLM) platform', 'ERP contract management module', 'Legal/compliance management tool', 'Excel/manual tracking'],
  },
  {
    code: '1.5',
    name: 'Manage Project Billing & Revenue',
    description: 'Project billing, revenue recognition, margin management and WIP reporting.',
    l3s: [
      { code: '1.5.1', name: 'Manage project billing — third party billing', question: 'How is third party project billing managed?', options: ['Automated invoice generation from milestone completions in project system', 'Finance produces invoices based on project manager confirmation', 'Manual billing process per contract terms', 'Ad-hoc billing on request', 'No formal billing process'], painPoint: 'What causes billing delays or errors on third party projects?' },
      { code: '1.5.2', name: 'Manage project billing — intercompany billing', question: 'How is intercompany project billing managed?', options: ['Automated intercompany billing with reconciliation', 'Finance manages intercompany billing with defined process', 'Manual intercompany billing via journal entries', 'Ad-hoc intercompany charges', 'No formal intercompany billing process'], painPoint: 'What causes intercompany billing disputes or reconciliation issues?' },
      { code: '1.5.3', name: 'Manage project revenue recognition (IFRS 15 / ASC 606)', question: 'How is project revenue recognition managed?', options: ['AI-assisted revenue recognition with automated IFRS 15/ASC 606 compliance', 'Structured revenue recognition process with Finance and Technical Accounting review', 'Finance manually calculates revenue recognition per contract', 'Revenue recognised on cash basis without formal accounting policy', 'No formal revenue recognition process'], painPoint: 'What revenue recognition risks exist in your project portfolio?' },
      { code: '1.5.4', name: 'Manage project profitability & margin reporting', question: 'How is project profitability and margin managed?', options: ['AI margin analysis with early warning of margin erosion', 'Real-time project margin reporting in project system', 'Periodic Finance-produced project P&L', 'Project profitability reviewed at completion only', 'No formal project profitability management'], painPoint: 'What causes project margins to deteriorate without early warning?' },
      { code: '1.5.5', name: 'Manage WIP, deferred & unbilled revenue', question: 'How is WIP, deferred and unbilled revenue managed?', options: ['Automated WIP calculation with real-time balance reporting', 'Finance calculates WIP and deferred revenue at period end', 'Manual WIP calculation via spreadsheet', 'WIP estimated rather than formally calculated', 'No formal WIP management'], painPoint: 'What causes WIP and deferred revenue balances to be inaccurate?' },
    ],
    toolQuestion: 'What tools support project billing and revenue management?',
    toolOptions: ['ERP billing and revenue module', 'Dedicated revenue recognition platform', 'Project billing system', 'Excel/manual'],
  },
  {
    code: '1.6',
    name: 'Capitalise & Close Project',
    description: 'Asset capitalisation, AUC management, project closure and post-project review.',
    l3s: [
      { code: '1.6.1', name: 'Capitalise project expenses including interest (AUC)', question: 'How are project costs capitalised as assets?', options: ['Automated capitalisation rules engine with system-enforced accounting', 'Finance applies capitalisation rules with defined criteria', 'Manual capitalisation review at project completion', 'Ad-hoc capitalisation decisions', 'No formal capitalisation process'], painPoint: 'What causes capitalisation errors or missed capitalisation opportunities?' },
      { code: '1.6.2', name: 'Manage asset under construction (AUC) to asset transfer', question: 'How is the transfer from AUC to fixed asset managed?', options: ['Automated AUC-to-asset transfer triggered by project completion', 'Finance manages AUC transfers with project team confirmation', 'Manual AUC transfer process at project close', 'AUC transfers performed only when flagged by audit', 'No formal AUC management process'], painPoint: 'What causes AUC balances to be aged or incorrectly transferred?' },
      { code: '1.6.3', name: 'Finalise accounting & close project', question: 'How is project accounting finalised and the project closed?', options: ['Formal project close checklist with system-enforced closure', 'Structured close process with Finance and project manager sign-off', 'Manual close process managed by Finance', 'Ad-hoc closure when project activity stops', 'No formal project close process'], painPoint: 'What causes projects to remain open after completion?' },
      { code: '1.6.4', name: 'Conduct post-project review & lessons learned', question: 'How are post-project reviews conducted?', options: ['AI comparison of actuals vs plan with automated lessons learned capture', 'Structured post-project review with Finance, PMO and stakeholders', 'Informal debrief with project team', 'Post-project reviews conducted only for failed projects', 'No formal post-project review'], painPoint: 'What prevents effective capture and use of project lessons learned?' },
      { code: '1.6.5', name: 'Capture & transfer knowledge to operations', question: 'How is project knowledge transferred to the operational business?', options: ['Structured knowledge transfer with formal handover documentation', 'Finance and project team joint handover to operations', 'Informal knowledge transfer from project manager', 'Minimal formal knowledge transfer', 'No formal knowledge transfer process'], painPoint: 'What causes knowledge to be lost at project handover to operations?' },
    ],
    toolQuestion: 'What tools support project capitalisation and closure?',
    toolOptions: ['ERP fixed asset and project close module', 'Asset management system', 'Project close management tool', 'Excel/manual'],
  },
  {
    code: '1.7',
    name: 'Connected Planning & FP&A Integration',
    description: 'Linking project spend to FP&A forecasts, treasury, benefits realisation and strategic objectives.',
    l3s: [
      { code: '1.7.1', name: 'Integrate project spend into rolling forecast', question: 'How is project spend integrated into the rolling forecast?', options: ['Real-time project actuals and commitments automatically feeding FP&A forecast', 'Monthly project data feeds into FP&A forecast manually', 'Finance manually adjusts forecast based on project reports', 'Project spend incorporated into forecast only at period end', 'Project spend not formally integrated into rolling forecast'], painPoint: 'What prevents real-time project data from feeding your FP&A forecast?' },
      { code: '1.7.2', name: 'Link project cashflow to treasury & working capital', question: 'How is project cashflow linked to treasury and working capital management?', options: ['AI cashflow prediction from project milestones integrated with treasury', 'Regular project cashflow forecast shared with treasury team', 'Treasury receives project cashflow estimates periodically', 'Project cashflow impact on treasury managed reactively', 'No formal link between project cashflow and treasury'], painPoint: 'What causes project cashflow to create unexpected working capital pressures?' },
      { code: '1.7.3', name: 'Report project portfolio impact on P&L and balance sheet', question: 'How is the project portfolio impact on P&L and balance sheet reported?', options: ['Automated integrated reporting showing project impact on financial statements', 'Finance produces regular project portfolio financial impact report', 'Ad-hoc analysis of project portfolio financial impact', 'Project impact on financials reviewed only at period end', 'No formal reporting of project portfolio financial impact'], painPoint: 'What makes it difficult to understand the financial statement impact of your project portfolio?' },
      { code: '1.7.4', name: 'Manage benefits realisation tracking', question: 'How are project benefits tracked and realised post-completion?', options: ['AI tracking of planned vs realised project benefits with automated alerts', 'Formal benefits realisation framework with Finance ownership', 'Periodic benefits review by project sponsor', 'Benefits tracked informally after project completion', 'No formal benefits realisation tracking'], painPoint: 'What prevents systematic tracking of project benefits after completion?' },
      { code: '1.7.5', name: 'Align project investment to strategic objectives', question: 'How is project investment aligned to strategic objectives?', options: ['Real-time strategic alignment dashboard linking projects to enterprise KPIs', 'Formal strategic review of project portfolio annually', 'Investment committee reviews strategic alignment at approval', 'Strategic alignment assessed informally', 'No formal strategic alignment process'], painPoint: 'What makes it difficult to demonstrate project portfolio strategic alignment?' },
    ],
    toolQuestion: 'What tools support connected planning and FP&A integration?',
    toolOptions: ['Integrated EPM/FP&A platform (Anaplan, Oracle EPM, SAP BPC)', 'ERP integrated planning', 'Separate project and FP&A systems with manual data transfer', 'Excel-based'],
  },
  {
    code: '1.8',
    name: 'Period End Close, Reporting & Analytics',
    description: 'Period end close for project accounting, portfolio reporting and ESG reporting.',
    l3s: [
      { code: '1.8.1', name: 'Close PA sub-ledger & reconcile with GL', question: 'How is the project accounting sub-ledger closed and reconciled?', options: ['Automated PA-to-GL reconciliation with exception alerting', 'Finance reconciles PA sub-ledger to GL each period', 'Manual reconciliation at period end', 'Reconciliation performed only when discrepancies arise', 'No formal PA-to-GL reconciliation'], painPoint: 'What causes PA sub-ledger to GL reconciliation differences?' },
      { code: '1.8.2', name: 'Prepare project accruals & cut-off journals', question: 'How are project accruals and cut-off journals prepared?', options: ['AI-predicted accruals based on open commitments and project progress', 'Finance calculates accruals from project data each period', 'Manual accrual estimates by project managers', 'Accruals estimated at a high level without project detail', 'No formal project accrual process'], painPoint: 'What causes project accruals to be inaccurate or delayed?' },
      { code: '1.8.3', name: 'Prepare project portfolio reporting & analytics', question: 'How is project portfolio reporting prepared?', options: ['AI-generated portfolio performance narrative with automated dashboards', 'Automated portfolio reporting from project management system', 'Finance manually compiles portfolio report each period', 'Ad-hoc portfolio reporting on request', 'No formal portfolio reporting'], painPoint: 'What makes project portfolio reporting time-consuming or incomplete?' },
      { code: '1.8.4', name: 'Report project profitability & ROI', question: 'How is project profitability and ROI reported?', options: ['Real-time project profitability dashboards with drill-down to L3 cost', 'Regular Finance-produced project P&L report', 'Periodic profitability analysis by Finance', 'Project profitability reported at completion only', 'No formal project profitability reporting'], painPoint: 'What data gaps limit your project profitability reporting?' },
      { code: '1.8.5', name: 'Prepare ESG & sustainability project reporting', question: 'How are ESG and sustainability metrics reported for projects?', options: ['Automated ESG metrics consolidation from project data with external reporting', 'Structured ESG reporting process aligned to GRI/TCFD standards', 'Manual ESG data collection from project teams', 'ESG reporting prepared only for external disclosure', 'No formal ESG project reporting'], painPoint: 'What prevents comprehensive and accurate ESG reporting across your project portfolio?' },
    ],
    toolQuestion: 'What tools support period end close and project reporting?',
    toolOptions: ['Financial close management platform', 'ERP project reporting module', 'BI/analytics platform (Power BI, Tableau)', 'Excel-based'],
  },
  {
    code: '1.9',
    name: 'AI & Intelligent Automation',
    description: 'AI-powered project intelligence, automation and future-ready capabilities.',
    l3s: [
      { code: '1.9.1', name: 'AI-assisted project cost forecasting & EAC prediction', question: 'How advanced is AI use in project cost forecasting?', options: ['ML models predicting estimate at completion with high accuracy', 'AI-assisted forecasting with human review', 'Basic trend analysis using BI tools', 'Exploring AI for cost forecasting', 'No AI in project forecasting'], painPoint: 'What prevents AI adoption in project cost forecasting?' },
      { code: '1.9.2', name: 'Automated project risk identification & early warning', question: 'How is AI used for project risk identification?', options: ['NLP analysis of project updates detecting risk signals automatically', 'AI risk scoring of project portfolio with early warning alerts', 'Basic rule-based risk alerts in project system', 'Exploring AI for risk identification', 'No AI in risk management'], painPoint: 'What data or system gaps prevent automated risk detection?' },
      { code: '1.9.3', name: 'Intelligent resource allocation optimisation', question: 'How is AI used for resource allocation across projects?', options: ['AI matching resource skills and availability to project needs in real-time', 'Optimisation tools supporting resource planning decisions', 'Manual resource allocation with spreadsheet support', 'Exploring AI for resource optimisation', 'No AI in resource management'], painPoint: 'What causes resource allocation to be suboptimal?' },
      { code: '1.9.4', name: 'Automated capitalisation & asset creation', question: 'How automated is the capitalisation and asset creation process?', options: ['Rules-based automation triggering AUC-to-asset transfers on project completion', 'Partially automated with Finance confirmation required', 'Manual capitalisation process with some system support', 'Exploring automation for capitalisation', 'Fully manual capitalisation'], painPoint: 'What prevents greater automation of the capitalisation process?' },
      { code: '1.9.5', name: 'Digital twin & real-time project intelligence', question: 'How advanced is real-time project intelligence capability?', options: ['Digital twin modelling of programme performance with predictive insights', 'Real-time project dashboards with live cost and progress data', 'Near-real-time reporting with daily data refresh', 'Periodic reporting with manual data compilation', 'No real-time project intelligence capability'], painPoint: 'What prevents real-time visibility across your project portfolio?' },
      { code: '1.9.6', name: 'Generative AI for project reporting & commentary', question: 'How is generative AI used in project reporting?', options: ['LLM-generated project status reports and board packs in production', 'Piloting generative AI for project commentary and narratives', 'Exploring generative AI for reporting use cases', 'Aware of generative AI but no active projects', 'No generative AI in project reporting'], painPoint: 'What prevents adoption of generative AI in your project reporting process?' },
    ],
    toolQuestion: 'What AI and automation tools are used in project management?',
    toolOptions: ['Dedicated AI/ML platform', 'RPA tools (UiPath, Power Automate)', 'ERP automation features', 'No AI or automation in use'],
  },
  {
    code: '1.10',
    name: 'Manage Process',
    description: 'Process ownership, governance, controls, capability and continuous improvement.',
    l3s: [
      { code: '1.10.1', name: 'Maintain policies, procedures & templates', question: 'How are project accounting policies and templates maintained?', options: ['Central repository with version control and regular review cycle', 'Finance team maintains and distributes policies', 'SharePoint/intranet based with ad-hoc updates', 'Policies exist but rarely updated', 'No formal policy management'], painPoint: 'What causes project accounting policies to be inconsistently applied?' },
      { code: '1.10.2', name: 'Maintain internal controls & audit trail', question: 'How are internal controls maintained in project accounting?', options: ['Integrated GRC platform with automated control testing', 'Formal control framework with periodic testing', 'Audit-driven controls', 'Informal control checks', 'No formal control framework'], painPoint: 'What control gaps exist in your project accounting process?' },
      { code: '1.10.3', name: 'Manage process efficiency & effectiveness', question: 'How is project accounting process efficiency managed?', options: ['AI process mining identifying project accounting bottlenecks', 'KPI tracking with continuous improvement programme', 'Periodic process reviews with improvement actions', 'Ad-hoc improvement initiatives', 'No formal efficiency management'], painPoint: 'What process inefficiencies exist in your project accounting function?' },
      { code: '1.10.4', name: 'Enhance business partner & employee experience', question: 'How is the experience of project stakeholders and employees improved?', options: ['Dedicated business partnering model with project teams', 'Finance team provides proactive support to project managers', 'Reactive support to project team requests', 'Minimal business partnering', 'No formal business partnering in project accounting'], painPoint: 'What frustrations do project managers experience with Finance support?' },
      { code: '1.10.5', name: 'Manage training & capability development', question: 'How is project accounting capability developed?', options: ['Structured L&D programme with project accounting competency framework', 'Role-specific training at onboarding and annually', 'Ad-hoc training when gaps identified', 'On-the-job learning only', 'No formal capability development'], painPoint: 'What capability gaps exist in your project accounting team?' },
      { code: '1.10.6', name: 'Archive & maintain records', question: 'How are project accounting records archived and maintained?', options: ['Automated archiving with defined retention policies', 'Structured archive management by Finance team', 'Manual archiving', 'Ad-hoc archiving', 'No formal record management'], painPoint: 'What challenges exist in maintaining project accounting records?' },
    ],
    toolQuestion: 'What tools support process management in project accounting?',
    toolOptions: ['Process management/mining platform', 'GRC/controls tool', 'SharePoint/intranet for documentation', 'Manual/informal'],
  },
  {
    code: '1.11',
    name: 'System Governance',
    description: 'Project system management, master data governance and digital enablement.',
    l3s: [
      { code: '1.11.1', name: 'Maintain project master data & hierarchies', question: 'How is project master data maintained?', options: ['AI data quality monitoring for project hierarchies with automated cleansing', 'Formal MDM process with Finance and IT ownership', 'Finance manually maintains project master data', 'Reactive data fixes when issues arise', 'No formal master data management'], painPoint: 'What master data quality issues affect your project accounting process?' },
      { code: '1.11.2', name: 'Maintain application configuration & security', question: 'How is project system configuration and security managed?', options: ['Formal configuration management with change control', 'IT manages with Finance oversight', 'IT manages independently', 'Ad-hoc configuration changes', 'No formal configuration management'], painPoint: 'What system configuration or access risks exist?' },
      { code: '1.11.3', name: 'Manage application releases & upgrades', question: 'How are project system upgrades managed?', options: ['Formal release management with Finance UAT and sign-off', 'IT-led with Finance UAT', 'Minimal testing before release', 'Reactive upgrade management', 'No formal release management'], painPoint: 'What causes project system upgrades to disrupt operations?' },
      { code: '1.11.4', name: 'Maintain reports & analytics layer', question: 'How is the project reporting and analytics layer maintained?', options: ['Centralised report catalogue with version control and governance', 'Finance team maintains standard project reports', 'IT manages report library with Finance input', 'Ad-hoc report maintenance', 'No formal report management'], painPoint: 'What report quality or consistency issues exist in project analytics?' },
      { code: '1.11.5', name: 'Manage system interfaces & integrations', question: 'How are project system interfaces managed?', options: ['Automated interface monitoring with alerting and self-healing', 'IT team manages interfaces with Finance oversight', 'IT manages independently', 'Reactive interface management', 'No formal interface management'], painPoint: 'What interface failures cause project data quality issues?' },
      { code: '1.11.6', name: 'Maintain process automation & digital labour', question: 'How is process automation governed in project accounting?', options: ['Centre of excellence for automation with formal governance framework', 'IT and Finance jointly manage automation tools', 'Ad-hoc automation maintenance', 'Minimal automation in place', 'No formal automation programme'], painPoint: 'What governance gaps exist around automation in project accounting?' },
    ],
    toolQuestion: 'What tools support system governance in project accounting?',
    toolOptions: ['ERP with formal governance (SAP, Oracle)', 'IT service management tool', 'Project system governance manual process', 'No formal system governance'],
  },
]

type Answers = Record<string, { selected: string[]; other: string; painPoint: string }>
type ToolAnswers = Record<string, { selected: string[]; tools: string }>

function AssessmentP2RPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const codeParam = searchParams.get('code')
  const initialStep = codeParam ? Math.max(0, steps.findIndex(s => s.code === codeParam)) : 0
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [answers, setAnswers] = useState<Answers>({})
  const [toolAnswers, setToolAnswers] = useState<ToolAnswers>({})
  const [effortData, setEffortData] = useState<Record<string, { headcount: number; roles: string[]; hoursPerCycle: number; comments: string }>>({})
  const [showReview, setShowReview] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loadingResponses, setLoadingResponses] = useState(true)

  useEffect(() => {
    const loadExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingResponses(false); return }

      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('process_name', 'Project to Result')

      if (assessmentData && assessmentData.length > 0) {
        const loadedAnswers: Answers = {}
        const loadedToolAnswers: ToolAnswers = {}
        for (const row of assessmentData) {
          if (row.l3_code === 'TOOL' || !row.l3_code) continue
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
      }

      const { data: effortDbData } = await supabase
        .from('process_effort')
        .select('*')
        .eq('user_id', user.id)
        .eq('process_name', 'Project to Result')

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
          process_name: 'Project to Result',
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

    for (const s of steps) {
      const effort = effortData[s.code]
      if (effort) {
        await supabase.from('process_effort').upsert({
          user_id: user.id,
          process_name: 'Project to Result',
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
    if (complete) router.push('/results-p2r')
  }

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

  const handleExportCSV = () => {
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
    const blob = new Blob([`RESPONSES\n${toCSV(responseRows)}\n\nEFFORT & ROI\n${toCSV(effortRows)}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'project-to-result-responses.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', color: '#1a1a2e', background: 'white', marginTop: '6px' }

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .as-sidebar { transform: translateX(-100%); position: fixed !important; z-index: 200; height: 100vh; transition: transform 0.3s; overflow-y: auto; }
        .as-sidebar.open { transform: translateX(0); }
        .as-topbar { display: flex !important; }
        .as-grid { grid-template-columns: 1fr !important; }
      }
      @media (min-width: 769px) {
        .as-topbar { display: none !important; }
      }
    `}</style>
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#f4f6f9' }}>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />}
      <div className={`as-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width: '240px', background: '#0F4C81', color: 'white', padding: '24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>FPI</div>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Finance Process</span>
        </div>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '32px', marginLeft: '46px' }}>Intelligence Platform</p>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project to Result</p>
        {steps.map((s, i) => (
          <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', opacity: i === currentStep && !showReview ? 1 : 0.5 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < currentStep || showReview ? '#1d9e75' : i === currentStep ? 'white' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: i === currentStep && !showReview ? '#0F4C81' : 'white', flexShrink: 0 }}>
              {i < currentStep || showReview ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '12px', color: i === currentStep && !showReview ? 'white' : '#a0c4e8', fontWeight: i === currentStep && !showReview ? '600' : '400' }}>{s.name}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', opacity: showReview ? 1 : 0.5 }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: showReview ? 'white' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: showReview ? '#0F4C81' : 'white', flexShrink: 0 }}>{steps.length + 1}</div>
          <span style={{ fontSize: '12px', color: showReview ? 'white' : '#a0c4e8', fontWeight: showReview ? '600' : '400' }}>Review & Complete</span>
        </div>
        <div style={{ marginTop: '24px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#a0c4e8', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>← Dashboard</button>
        </div>
      </div>

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
                <button onClick={handleExportCSV} style={{ padding: '10px 20px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>⬇ Export to CSV</button>
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
            <div className="as-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0F4C81' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '30px', height: '30px', background: '#4fa3e0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'white' }}>FPI</div>
    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Record to Report</span>
  </div>
  <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>☰</button>
</div>
<div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #e0e4ea' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Dashboard → Process Explorer → Project to Result → {step.code} {step.name}</div>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>Step {currentStep + 1} of {steps.length} — {step.name}</h1>
              <p style={{ color: '#666', fontSize: '14px' }}>{step.description}</p>
            </div>

            <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
              <div className="as-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
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
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>List the main tools or systems used</div>
                  <input type="text" placeholder="e.g. SAP PS, Oracle Projects, Primavera, Planview, MS Project..." value={toolAnswers[step.code]?.tools || ''} onChange={e => updateTools(step.code, e.target.value)} style={inputStyle} />
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>This helps us assess your project accounting technology maturity.</div>
                </div>

                <div style={{ marginTop: '24px', padding: '20px', background: '#f0f7ff', borderRadius: '10px', border: '1px solid #d0e8ff' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F4C81', marginBottom: '16px' }}>👥 Team & Effort</div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>How many people are involved in this step?</div>
                    <input type="number" min="0" placeholder="e.g. 3" value={effortData[step.code]?.headcount || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: parseInt(e.target.value) || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: prev[step.code]?.hoursPerCycle || 0, comments: prev[step.code]?.comments || '' } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '120px', color: '#333', background: 'white' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>What roles are involved? (select all that apply)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {['CFO / Finance Director', 'Financial Controller', 'Project Accounting Manager', 'Project Accountant', 'FP&A Manager / Analyst', 'Project Manager / Programme Manager', 'PMO Lead', 'Capital Project Manager', 'Commercial Manager', 'Contracts Manager', 'Treasury Analyst', 'Tax Manager', 'ERP/Systems Administrator', 'IT Manager', 'Data Analyst / BI Developer', 'External Auditor'].map(role => (
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
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>How many hours per cycle does the team spend on this step?</div>
                    <input type="number" min="0" placeholder="e.g. 40" value={effortData[step.code]?.hoursPerCycle || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: parseInt(e.target.value) || 0, comments: prev[step.code]?.comments || '' } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '120px', color: '#333', background: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Any additional comments about this step's team or effort?</div>
                    <textarea placeholder="e.g. Project accounting team is shared with the broader Finance function..." value={effortData[step.code]?.comments || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: prev[step.code]?.hoursPerCycle || 0, comments: e.target.value } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '100%', minHeight: '80px', resize: 'vertical', color: '#333', background: 'white' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #e0e4ea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <button onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.push('/process-explorer')} style={{ padding: '10px 20px', background: 'white', color: '#0F4C81', border: '1px solid #0F4C81', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>← Back</button>
              <div style={{ fontSize: '13px', color: '#666' }}>{totalAnswered} of {step.l3s.length} answered</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => saveToSupabase(false).then(() => router.push('/dashboard'))} disabled={saving} style={{ padding: '10px 20px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save & Exit'}</button>
                <button onClick={() => saveToSupabase(false)} disabled={saving} style={{ padding: '10px 20px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Progress'}</button>
                {currentStep < steps.length - 1 ? (
                  <button onClick={() => saveToSupabase(false).then(() => setCurrentStep(currentStep + 1))} style={{ padding: '10px 24px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Next: {steps[currentStep + 1].name} →</button>
                ) : (
                  <button onClick={() => saveToSupabase(false).then(() => setShowReview(true))} disabled={saving} style={{ padding: '10px 24px', background: '#0F4C81', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Review & Complete →'}</button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function AssessmentP2RPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssessmentP2RPage />
    </Suspense>
  )
}
