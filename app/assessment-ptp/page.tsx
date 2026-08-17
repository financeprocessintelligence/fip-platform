'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const steps = [
  {
    code: '1.1',
    name: 'Supplier Management',
    description: 'Onboarding, master data, and performance management of suppliers.',
    l3s: [
      { code: '1.1.1', name: 'Supplier Onboarding & Qualification', question: 'How are new suppliers onboarded and qualified?', options: ['Formal digital onboarding with automated checks', 'Structured onboarding process with manual steps', 'Basic supplier registration form', 'Ad-hoc onboarding per request', 'No formal process'], painPoint: 'What causes delays or risks in your supplier onboarding process?' },
      { code: '1.1.2', name: 'Supplier Master Data Management', question: 'How is supplier master data managed and maintained?', options: ['Centralised MDM system with automated validation', 'Finance/Procurement owns and maintains centrally', 'ERP-managed with periodic reviews', 'Decentralised with multiple data owners', 'No formal master data management'], painPoint: 'What data quality issues affect your supplier master data?' },
      { code: '1.1.3', name: 'Supplier Performance Monitoring', question: 'How is supplier performance tracked and managed?', options: ['Automated KPI dashboards with AI-driven alerts', 'Structured scorecards reviewed regularly', 'Periodic manual reviews', 'Informal feedback only', 'Not formally monitored'], painPoint: 'What prevents effective supplier performance management?' },
      { code: '1.1.4', name: 'Supplier Relationship Management', question: 'How are strategic supplier relationships managed?', options: ['Formal SRM programme with executive sponsorship', 'Dedicated relationship managers per supplier', 'Regular review meetings with key suppliers', 'Transactional engagement only', 'No formal relationship management'], painPoint: 'What limits the quality of your supplier relationships?' },
      { code: '1.1.5', name: 'Supplier Risk Assessment', question: 'How is supplier risk identified and managed?', options: ['AI-powered continuous risk monitoring', 'Formal risk assessment framework', 'Periodic financial and compliance checks', 'Ad-hoc risk reviews when issues arise', 'No formal risk assessment'], painPoint: 'What supplier risks are you most concerned about?' },
    ],
    toolQuestion: 'How is supplier management supported in your organisation?',
    toolOptions: ['Dedicated supplier management platform (e.g. Coupa, Ariba)', 'ERP-based supplier management', 'Excel/manual processes', 'Mix of systems'],
  },
  {
    code: '1.2',
    name: 'Requisitioning',
    description: 'Creation, approval and management of purchase requisitions.',
    l3s: [
      { code: '1.2.1', name: 'Purchase Requisition Creation', question: 'How are purchase requisitions raised?', options: ['Self-service portal with AI-suggested vendors and prices', 'ERP-based electronic requisitioning', 'Structured paper or email-based process', 'Ad-hoc requests to procurement team', 'No formal requisition process'], painPoint: 'What makes raising requisitions slow or error-prone?' },
      { code: '1.2.2', name: 'Requisition Approval & Budget Validation', question: 'How are requisitions approved and budgets validated?', options: ['Automated approval routing with real-time budget checks', 'Structured workflow with defined approval limits', 'Manual approval via email', 'Manager verbal approval', 'No formal approval process'], painPoint: 'What causes bottlenecks in the requisition approval process?' },
      { code: '1.2.3', name: 'Catalogue & Self-Service Procurement', question: 'How do staff access approved goods and services?', options: ['AI-powered catalogue with personalised recommendations', 'Managed catalogue with punch-out to supplier sites', 'Static approved supplier list', 'No catalogue — direct contact with suppliers', 'Not applicable'], painPoint: 'What limits staff adoption of self-service procurement?' },
      { code: '1.2.4', name: 'Requisition Compliance & Policy Checking', question: 'How is policy compliance checked at the requisition stage?', options: ['Automated AI policy compliance checks at point of entry', 'System-enforced rules with alerts', 'Manual Finance/Procurement review', 'Post-hoc audit of requisitions', 'No compliance checking'], painPoint: 'What causes policy breaches at the requisition stage?' },
      { code: '1.2.5', name: 'Requisition Lifecycle Management', question: 'How are requisitions tracked from creation to fulfilment?', options: ['End-to-end digital tracking with automated notifications', 'ERP status tracking', 'Manual spreadsheet tracking', 'Ad-hoc status checks with suppliers', 'No tracking in place'], painPoint: 'What visibility gaps exist in your requisition process?' },
    ],
    toolQuestion: 'What tools support your requisitioning process?',
    toolOptions: ['Procurement platform (e.g. Coupa, Ariba, Jaggaer)', 'ERP-based requisitioning', 'Excel/email-based', 'Mix of tools'],
  },
  {
    code: '1.3',
    name: 'Purchasing',
    description: 'Purchase order creation, management and supplier confirmation.',
    l3s: [
      { code: '1.3.1', name: 'Purchase Order Creation & Issuance', question: 'How are purchase orders created and issued to suppliers?', options: ['Auto-generated from approved requisitions with e-transmission', 'ERP-generated with manual review', 'Semi-automated with Finance/Procurement involvement', 'Manual PO creation per request', 'No formal PO process'], painPoint: 'What causes errors or delays in PO creation?' },
      { code: '1.3.2', name: 'PO Approval & Compliance', question: 'How are purchase orders approved and validated for compliance?', options: ['Automated approval with spend policy validation', 'Structured tiered approval based on value', 'Manual approval by procurement/finance', 'Informal sign-off only', 'No formal PO approval'], painPoint: 'What compliance risks exist in your PO approval process?' },
      { code: '1.3.3', name: 'PO Amendments & Cancellations', question: 'How are PO changes and cancellations managed?', options: ['Formal change control with automated audit trail', 'Structured amendment process via system', 'Email-based amendment requests', 'Ad-hoc verbal changes', 'No formal process'], painPoint: 'What causes issues when POs need to be amended or cancelled?' },
      { code: '1.3.4', name: 'Supplier Order Confirmation', question: 'How do suppliers confirm receipt and acceptance of POs?', options: ['Electronic confirmation via supplier portal', 'Email confirmation tracked in system', 'Phone/email confirmation manually recorded', 'Assumed confirmed unless queried', 'No confirmation process'], painPoint: 'What causes miscommunication with suppliers on orders?' },
      { code: '1.3.5', name: 'PO Lifecycle Tracking & Expediting', question: 'How are open POs tracked and expedited?', options: ['AI-predicted delivery delays with proactive alerts', 'Automated open PO reporting and follow-up', 'Periodic manual review of open POs', 'Ad-hoc expediting when issues arise', 'No formal tracking'], painPoint: 'What causes delivery failures or late supplier fulfilment?' },
    ],
    toolQuestion: 'What tools support your purchasing process?',
    toolOptions: ['Procurement platform (e.g. Coupa, Ariba)', 'ERP purchase order module', 'Excel/manual', 'Mix of systems'],
  },
  {
    code: '1.4',
    name: 'Receiving',
    description: 'Goods receipt, service confirmation and discrepancy management.',
    l3s: [
      { code: '1.4.1', name: 'Goods Receipt Processing', question: 'How are goods receipts processed and recorded?', options: ['Automated GR with barcode/RFID and AI PO matching', 'ERP-based GR with manual data entry', 'Paper-based GR notes entered into system', 'Email confirmation used as GR', 'No formal goods receipt process'], painPoint: 'What causes delays or errors in goods receipt processing?' },
      { code: '1.4.2', name: 'Service Confirmation & Acceptance', question: 'How are services confirmed as delivered and accepted?', options: ['Digital service confirmation via supplier portal', 'Formal sign-off process by budget holder', 'Email-based confirmation', 'Assumed delivered unless queried', 'No formal service acceptance'], painPoint: 'What makes service confirmation difficult to manage?' },
      { code: '1.4.3', name: 'Returns & Rejections Management', question: 'How are returns and rejected goods managed?', options: ['Formal returns management process with system tracking', 'Structured returns process with supplier notification', 'Ad-hoc returns managed case by case', 'Informal process with no tracking', 'No formal returns process'], painPoint: 'What causes losses or disputes in the returns process?' },
      { code: '1.4.4', name: 'Discrepancy Identification & Resolution', question: 'How are discrepancies between POs and deliveries identified?', options: ['AI-driven automated variance detection and alerting', 'System-based three-way match with exception reporting', 'Manual comparison by Finance/Procurement', 'Discrepancies identified only at invoice stage', 'No formal discrepancy management'], painPoint: 'What causes discrepancies to go undetected or unresolved?' },
      { code: '1.4.5', name: 'GRNI Recording & Management', question: 'How are goods received not invoiced (GRNI) accruals managed?', options: ['Automated GRNI postings with real-time ageing alerts', 'ERP-generated GRNI with periodic review', 'Manual GRNI accrual at period end', 'GRNI estimated rather than tracked', 'GRNI not formally managed'], painPoint: 'What causes GRNI balances to be inaccurate or aged?' },
    ],
    toolQuestion: 'What tools support your receiving process?',
    toolOptions: ['Warehouse/inventory management system', 'ERP goods receipt module', 'Paper-based / manual', 'Mix of systems'],
  },
  {
    code: '1.5',
    name: 'Invoice Processing & Payment',
    description: 'Invoice receipt, validation, three-way matching and payment execution.',
    l3s: [
      { code: '1.5.1', name: 'Invoice Receipt & Capture', question: 'How are supplier invoices received and captured?', options: ['AI/OCR automated capture from all invoice formats', 'Electronic invoicing via supplier portal', 'Scanned paper invoices with OCR', 'Manual keying of paper invoices', 'Email-based with manual processing'], painPoint: 'What causes invoice processing to be slow or error-prone?' },
      { code: '1.5.2', name: 'Three-Way Matching (PO, GR, Invoice)', question: 'How is three-way matching performed?', options: ['Fully automated matching with exception-only review', 'System-assisted matching with manual sign-off', 'Semi-automated matching with Finance review', 'Manual matching by AP team', 'No formal three-way match'], painPoint: 'What causes matching failures or delays?' },
      { code: '1.5.3', name: 'Invoice Exception Handling', question: 'How are invoice exceptions and disputes managed?', options: ['AI-prioritised exception queue with resolution recommendations', 'Structured exception workflow with SLA tracking', 'Manual exception log managed by AP team', 'Ad-hoc resolution per exception', 'No formal exception management'], painPoint: 'What causes invoice exceptions to take too long to resolve?' },
      { code: '1.5.4', name: 'Invoice Approval & Posting', question: 'How are invoices approved and posted to the ledger?', options: ['Automated approval based on matching rules', 'Structured approval workflow by value threshold', 'Manual approval by budget holder and Finance', 'Email-based approval process', 'No formal approval before posting'], painPoint: 'What causes invoice approval bottlenecks?' },
      { code: '1.5.5', name: 'Payment Run Management', question: 'How are payment runs managed and executed?', options: ['AI-optimised payment timing with automated runs', 'Scheduled automated payment runs', 'Semi-automated with Finance sign-off', 'Manual payment per invoice', 'No formal payment run process'], painPoint: 'What causes late or incorrect payments?' },
      { code: '1.5.6', name: 'Prepayments & Advance Billing Management', question: 'How are prepayments and advance invoices managed?', options: ['System-managed with automated reconciliation', 'Finance tracks and reconciles prepayments', 'Manual tracking via spreadsheet', 'Ad-hoc management per case', 'Not formally managed'], painPoint: 'What causes prepayment errors or reconciliation issues?' },
    ],
    toolQuestion: 'What tools support your invoice processing?',
    toolOptions: ['AP automation platform (e.g. Basware, Tungsten, Coupa)', 'ERP AP module', 'OCR/scanning tool only', 'Manual/email-based'],
  },
  {
    code: '1.6',
    name: 'Cash & Payment Management',
    description: 'Payment terms optimisation, dynamic discounting and working capital management.',
    l3s: [
      { code: '1.6.1', name: 'Payment Terms Strategy & Management', question: 'How are payment terms set and managed with suppliers?', options: ['AI-modelled working capital optimisation of payment terms', 'Centralised payment terms policy with regular review', 'Standard terms applied with ad-hoc negotiation', 'Terms set at supplier onboarding and rarely reviewed', 'No formal payment terms strategy'], painPoint: 'What prevents you from optimising payment terms across your supplier base?' },
      { code: '1.6.2', name: 'Early Payment & Dynamic Discounting', question: 'How are early payment discount opportunities managed?', options: ['AI-driven identification of optimal early payment opportunities', 'Dynamic discounting platform in use', 'Manual identification of early payment discounts', 'Occasionally taken on an ad-hoc basis', 'Not pursued'], painPoint: 'What prevents you from capturing early payment discounts systematically?' },
      { code: '1.6.3', name: 'Foreign Currency & Cross-Border Payments', question: 'How are foreign currency payments managed?', options: ['Automated FX management with hedging integration', 'Treasury-managed FX with formal policy', 'Finance manages FX on a case-by-case basis', 'Payments made at spot rate with no strategy', 'Not applicable'], painPoint: 'What FX or cross-border payment risks concern you?' },
      { code: '1.6.4', name: 'Bank Account & Payment Method Management', question: 'How are bank accounts and payment methods managed?', options: ['Centralised bank account management with automated controls', 'Treasury manages accounts with Finance oversight', 'Finance team manages manually', 'Ad-hoc management with limited oversight', 'No formal management'], painPoint: 'What risks exist in your payment method management?' },
      { code: '1.6.5', name: 'Cash Flow Forecasting for Payables', question: 'How is the payables cash flow forecast managed?', options: ['AI-driven payables cash flow prediction integrated with treasury', 'Regular payables forecast produced by Finance', 'Periodic manual estimate of upcoming payments', 'Cash flow reviewed reactively', 'No payables forecast produced'], painPoint: 'What makes payables cash flow forecasting unreliable?' },
    ],
    toolQuestion: 'What tools support your cash and payment management?',
    toolOptions: ['Treasury management system', 'ERP cash management module', 'Dynamic discounting platform', 'Excel/manual'],
  },
  {
    code: '1.7',
    name: 'P-Card & T&E Administration',
    description: 'Corporate card issuance, T&E policy, expense processing and reconciliation.',
    l3s: [
      { code: '1.7.1', name: 'P-Card & T&E Card Issuance & Management', question: 'How are corporate cards issued and managed?', options: ['Fully automated card management with real-time controls', 'Centralised card management with formal policy', 'Finance manages cards manually', 'Ad-hoc card issuance', 'No corporate card programme'], painPoint: 'What challenges exist in managing your corporate card programme?' },
      { code: '1.7.2', name: 'Expense Submission & Policy Compliance', question: 'How are expenses submitted and checked for policy compliance?', options: ['AI-powered compliance checks and receipt matching at submission', 'Mobile app with automated policy validation', 'Online expense tool with manual policy review', 'Paper or email-based submission', 'No formal expense process'], painPoint: 'What causes policy violations in expense submissions?' },
      { code: '1.7.3', name: 'Expense Approval & Workflow', question: 'How are expense claims approved?', options: ['AI-assisted routing based on spend category and amount', 'Automated workflow with defined approval limits', 'Manual line manager approval', 'Email-based approval', 'No formal approval process'], painPoint: 'What causes delays in expense approval?' },
      { code: '1.7.4', name: 'Card Transaction Reconciliation', question: 'How are card transactions reconciled?', options: ['Automated reconciliation with anomaly flagging', 'System-assisted reconciliation with Finance review', 'Monthly manual reconciliation', 'Ad-hoc reconciliation when issues arise', 'Not formally reconciled'], painPoint: 'What causes reconciliation errors or delays?' },
      { code: '1.7.5', name: 'T&E Reporting & Analytics', question: 'How is T&E spend reported and analysed?', options: ['AI insights on spend patterns, trends and policy violations', 'Regular T&E dashboards and management reports', 'Periodic Finance-produced reports', 'Ad-hoc reporting on request', 'No formal T&E reporting'], painPoint: 'What visibility gaps exist in your T&E spend?' },
    ],
    toolQuestion: 'What tools support your P-Card and T&E process?',
    toolOptions: ['Dedicated expense platform (e.g. Concur, Expensify)', 'Card provider expense tool', 'ERP expense module', 'Excel/manual'],
  },
  {
    code: '1.8',
    name: 'Purchasing/Payment Inquiries',
    description: 'Supplier and internal queries on orders, invoices and payments.',
    l3s: [
      { code: '1.8.1', name: 'Supplier Payment Status Inquiries', question: 'How do suppliers query payment status?', options: ['AI-powered self-service supplier portal with real-time status', 'Supplier portal with payment visibility', 'Dedicated AP helpdesk function', 'Email or phone queries managed by AP team', 'No formal supplier inquiry process'], painPoint: 'What causes high volumes of supplier payment queries?' },
      { code: '1.8.2', name: 'Invoice Dispute Management', question: 'How are invoice disputes managed and resolved?', options: ['AI classification and resolution routing for disputes', 'Formal dispute management workflow with SLAs', 'Structured dispute log managed by AP', 'Ad-hoc resolution per dispute', 'No formal dispute management'], painPoint: 'What causes invoice disputes to take too long to resolve?' },
      { code: '1.8.3', name: 'Internal Procurement Query Management', question: 'How are internal queries on procurement managed?', options: ['Self-service knowledge base with AI chatbot support', 'Dedicated procurement helpdesk', 'Email-based query management', 'Ad-hoc responses from procurement team', 'No formal internal query process'], painPoint: 'What causes internal frustration with procurement support?' },
      { code: '1.8.4', name: 'Overpayment & Duplicate Payment Resolution', question: 'How are overpayments and duplicate payments identified and resolved?', options: ['AI detection of duplicates before payment processing', 'Automated duplicate payment detection in AP system', 'Periodic manual review of payment history', 'Identified reactively when raised by suppliers', 'No formal process'], painPoint: 'What causes overpayments or duplicate payments to occur?' },
    ],
    toolQuestion: 'What tools support your inquiry management process?',
    toolOptions: ['Supplier portal with self-service capability', 'Helpdesk/ticketing system', 'AP system query management', 'Email/phone only'],
  },
  {
    code: '1.9',
    name: 'Compliance & Controls',
    description: 'Segregation of duties, audit trail, fraud prevention and policy governance.',
    l3s: [
      { code: '1.9.1', name: 'Segregation of Duties Management', question: 'How is segregation of duties managed in the PtP process?', options: ['System-enforced SoD with automated conflict detection', 'Formal SoD framework with regular access reviews', 'Manual SoD controls reviewed periodically', 'Informal awareness of SoD requirements', 'No formal SoD controls'], painPoint: 'What SoD gaps or conflicts exist in your PtP process?' },
      { code: '1.9.2', name: 'Fraud Detection & Prevention', question: 'How is fraud risk managed in the PtP process?', options: ['AI behavioural analytics detecting anomalous spend patterns', 'Automated fraud detection rules in AP system', 'Periodic manual audit of transactions', 'Reactive investigation when fraud is suspected', 'No formal fraud prevention'], painPoint: 'What fraud risks are you most concerned about in PtP?' },
      { code: '1.9.3', name: 'Audit Trail & Documentation Management', question: 'How is the audit trail maintained for PtP transactions?', options: ['Fully automated digital audit trail with immutable records', 'System-maintained audit trail with document management', 'Manual documentation stored centrally', 'Ad-hoc documentation per transaction', 'No formal audit trail'], painPoint: 'What audit evidence gaps exist in your PtP process?' },
      { code: '1.9.4', name: 'Regulatory & Tax Compliance', question: 'How is regulatory and tax compliance managed in PtP?', options: ['AI-assisted VAT/tax coding and compliance monitoring', 'Formal tax compliance process with Finance/Tax review', 'Manual tax coding with periodic Tax team review', 'Tax compliance managed reactively', 'No formal regulatory compliance process'], painPoint: 'What regulatory or tax compliance risks exist in your PtP process?' },
      { code: '1.9.5', name: 'Internal Controls Testing & Monitoring', question: 'How are internal controls tested and monitored in PtP?', options: ['Continuous AI-powered control monitoring and alerting', 'Automated control testing with exception reporting', 'Periodic internal audit of key PtP controls', 'Annual external audit as primary control check', 'No formal controls testing'], painPoint: 'What control weaknesses have been identified in your PtP process?' },
    ],
    toolQuestion: 'What tools support compliance and controls in PtP?',
    toolOptions: ['GRC platform (e.g. SAP GRC, RSA Archer)', 'ERP built-in controls', 'Manual controls framework', 'Audit tools only'],
  },
  {
    code: '1.10',
    name: 'Period End Close',
    description: 'AP accruals, GRNI reconciliation and period end reporting for payables.',
    l3s: [
      { code: '1.10.1', name: 'AP Accruals & Cut-off Management', question: 'How are AP accruals and cut-off managed at period end?', options: ['AI-predicted accruals based on open POs and GRNIs', 'Automated accrual generation from open items', 'Finance manually calculates accruals', 'Accruals estimated with limited supporting data', 'No formal accrual process'], painPoint: 'What causes AP accruals to be inaccurate or late?' },
      { code: '1.10.2', name: 'GRNI Reconciliation & Clearance', question: 'How is the GRNI balance reconciled and cleared?', options: ['Automated matching and AI-driven ageing analysis', 'System-assisted reconciliation with Finance review', 'Manual GRNI reconciliation at period end', 'GRNI reviewed only when flagged', 'No formal GRNI reconciliation'], painPoint: 'What causes aged or unreconciled GRNI balances?' },
      { code: '1.10.3', name: 'AP Sub-Ledger to GL Reconciliation', question: 'How is the AP sub-ledger reconciled to the general ledger?', options: ['Automated reconciliation with exception alerting', 'System-generated reconciliation reviewed by Finance', 'Manual reconciliation produced by AP team', 'Reconciliation performed only at year end', 'No formal reconciliation'], painPoint: 'What causes reconciling differences between AP and GL?' },
      { code: '1.10.4', name: 'Prepaid Expense Amortisation', question: 'How are prepaid expenses managed and amortised?', options: ['Automated schedule-based amortisation', 'Finance manages amortisation schedule in system', 'Manual spreadsheet-based amortisation', 'Prepayments expensed when paid rather than amortised', 'Not formally managed'], painPoint: 'What causes prepaid amortisation errors?' },
      { code: '1.10.5', name: 'Period End AP Reporting', question: 'How is period end AP reporting produced?', options: ['Automated AP reporting with real-time dashboards', 'Finance produces standard AP report pack', 'Manual reports produced from system extracts', 'Ad-hoc reporting on request', 'No formal period end AP reporting'], painPoint: 'What makes period end AP reporting slow or unreliable?' },
    ],
    toolQuestion: 'What tools support your period end close for payables?',
    toolOptions: ['Financial close management platform', 'ERP close module', 'Excel-based close process', 'Mix of tools'],
  },
  {
    code: '1.11',
    name: 'Reporting & Analytics',
    description: 'PtP performance reporting, spend analytics and KPI management.',
    l3s: [
      { code: '1.11.1', name: 'Spend Analytics & Category Reporting', question: 'How is spend analysed and reported by category?', options: ['AI-driven spend classification and insight generation', 'Dedicated spend analytics platform', 'BI tool-based reporting', 'Manual Excel-based spend analysis', 'No formal spend analytics'], painPoint: 'What limits your ability to gain meaningful spend insights?' },
      { code: '1.11.2', name: 'AP & Payment Performance Reporting', question: 'How is AP and payment performance reported?', options: ['Real-time automated AP dashboards', 'Regular Finance-produced AP performance reports', 'Periodic manual reports', 'Ad-hoc reporting only', 'No formal AP performance reporting'], painPoint: 'What AP performance metrics are you unable to track effectively?' },
      { code: '1.11.3', name: 'Process Efficiency & Touchless Rate Reporting', question: 'How is PtP process efficiency measured and reported?', options: ['AI benchmarking of touchless rates against industry standards', 'Automated process efficiency KPI reporting', 'Periodic manual efficiency analysis', 'Efficiency measured informally', 'Not measured'], painPoint: 'What prevents you from improving your touchless invoice processing rate?' },
      { code: '1.11.4', name: 'Supplier Performance Reporting', question: 'How is supplier performance reported to stakeholders?', options: ['Automated supplier scorecards with real-time data', 'Regular structured supplier performance reports', 'Periodic manual supplier reviews', 'Ad-hoc reporting when issues arise', 'No formal supplier performance reporting'], painPoint: 'What data gaps limit your supplier performance reporting?' },
      { code: '1.11.5', name: 'Working Capital & DPO Reporting', question: 'How is working capital and days payable outstanding reported?', options: ['AI modelling of DPO optimisation scenarios', 'Regular DPO and working capital reporting to CFO', 'Periodic Finance-produced working capital analysis', 'DPO calculated at year end only', 'Not formally reported'], painPoint: 'What limits your ability to optimise DPO and working capital?' },
    ],
    toolQuestion: 'What tools support your PtP reporting and analytics?',
    toolOptions: ['BI/Analytics platform (Power BI, Tableau etc.)', 'Procurement analytics platform', 'ERP standard reports', 'Excel-based'],
  },
  {
    code: '1.12',
    name: 'Manage Process',
    description: 'Process ownership, continuous improvement and change management.',
    l3s: [
      { code: '1.12.1', name: 'Process Ownership & Governance', question: 'How is process ownership defined and governed in PtP?', options: ['Formal Global Process Owner with defined governance framework', 'Named process owner with documented responsibilities', 'Finance/Procurement jointly own informally', 'Ownership unclear or disputed', 'No formal process ownership'], painPoint: 'What governance gaps exist in your PtP process?' },
      { code: '1.12.2', name: 'Process Documentation & SOPs', question: 'How are PtP process documents and SOPs managed?', options: ['Centralised digital repository with version control and regular review', 'Documented SOPs maintained by process owner', 'SOPs exist but not regularly updated', 'Limited documentation in place', 'No formal process documentation'], painPoint: 'What causes process documentation to be inconsistent or outdated?' },
      { code: '1.12.3', name: 'Continuous Improvement & Lean Management', question: 'How is continuous improvement managed in PtP?', options: ['AI process mining to identify waste and improvement opportunities', 'Formal CI programme with structured methodology', 'Ad-hoc improvement initiatives', 'Improvements driven reactively by audit findings', 'No formal CI approach'], painPoint: 'What prevents sustainable continuous improvement in PtP?' },
      { code: '1.12.4', name: 'Training & Capability Development', question: 'How is PtP team capability developed?', options: ['Structured L&D programme with competency framework', 'Role-specific training on onboarding and annually', 'Ad-hoc training when gaps identified', 'On-the-job learning only', 'No formal capability development'], painPoint: 'What capability gaps exist in your PtP team?' },
      { code: '1.12.5', name: 'Change Management & Adoption', question: 'How are process changes managed and embedded?', options: ['Formal change management with structured adoption framework', 'Communications and training plan for changes', 'Email communication of changes', 'Changes announced informally', 'No formal change management'], painPoint: 'What causes process changes to fail to stick?' },
    ],
    toolQuestion: 'What tools support process management in PtP?',
    toolOptions: ['Process management/mining platform', 'SharePoint/intranet for documentation', 'Project management tool for CI', 'Manual/informal'],
  },
  {
    code: '1.13',
    name: 'System Governance',
    description: 'ERP and procurement system management, data governance and digital enablement.',
    l3s: [
      { code: '1.13.1', name: 'ERP & Procurement System Management', question: 'How are ERP and procurement systems managed?', options: ['Centralised system governance with dedicated team', 'IT manages with Finance/Procurement input', 'Finance manages system configuration', 'Shared responsibility with no clear owner', 'No formal system management'], painPoint: 'What system limitations impact your PtP process?' },
      { code: '1.13.2', name: 'Master Data Governance', question: 'How is master data governed across PtP systems?', options: ['AI-powered data quality monitoring and automated cleansing', 'Formal MDM programme with data stewards', 'Finance/IT jointly manage master data', 'Reactive data fixes when issues arise', 'No formal master data governance'], painPoint: 'What master data quality issues affect your PtP process?' },
      { code: '1.13.3', name: 'System Access & Security Management', question: 'How is system access managed in PtP?', options: ['Automated access management with continuous monitoring', 'Formal access review process with IT and Finance', 'Periodic access reviews', 'Access managed reactively', 'No formal access management'], painPoint: 'What access control risks exist in your PtP systems?' },
      { code: '1.13.4', name: 'Automation & AI Tool Governance', question: 'How are automation and AI tools governed in PtP?', options: ['Formal AI/RPA governance framework with ethics review', 'Structured governance for each automation deployed', 'IT oversight of automation tools', 'Limited governance of automation in place', 'No governance of automation or AI tools'], painPoint: 'What governance gaps exist around automation and AI in PtP?' },
      { code: '1.13.5', name: 'Digital & Technology Roadmap Management', question: 'How is the PtP technology roadmap managed?', options: ['Integrated digital roadmap aligned to enterprise strategy', 'Finance/Procurement-led technology roadmap', 'IT-led roadmap with Finance input', 'Ad-hoc technology decisions', 'No formal technology roadmap'], painPoint: 'What technology gaps are holding back your PtP capability?' },
    ],
    toolQuestion: 'What tools support system governance in PtP?',
    toolOptions: ['Enterprise architecture platform', 'IT service management tool', 'ERP governance module', 'Manual/informal governance'],
  },
]

type Answers = Record<string, { selected: string[]; other: string; painPoint: string }>
type ToolAnswers = Record<string, { selected: string[]; tools: string }>

function AssessmentPtPPage() {
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
  const [saving, setSaving] = useState(false)
  const [loadingResponses, setLoadingResponses] = useState(true)

  useEffect(() => {
    const loadExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingResponses(false); return }

      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('process_name', 'Procure to Pay')

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
        .eq('process_name', 'Procure to Pay')

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
          process_name: 'Procure to Pay',
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
          process_name: 'Procure to Pay',
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
    if (complete) router.push('/results-ptp')
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
    a.download = 'procure-to-pay-responses.csv'
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
      {/* Sidebar */}
      <div className={`as-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width: '240px', background: '#0F4C81', color: 'white', padding: '24px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', background: '#4fa3e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>FPI</div>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Finance Process</span>
        </div>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '32px', marginLeft: '46px' }}>Intelligence Platform</p>
        <p style={{ fontSize: '11px', color: '#a0c4e8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Procure to Pay</p>
        {steps.map((s, i) => (
          <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', opacity: i === currentStep && !showReview ? 1 : 0.5 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < currentStep || showReview ? '#1d9e75' : i === currentStep ? 'white' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: i === currentStep && !showReview ? '#0F4C81' : 'white', flexShrink: 0 }}>
              {i < currentStep || showReview ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '12px', color: i === currentStep && !showReview ? 'white' : '#a0c4e8', fontWeight: i === currentStep && !showReview ? '600' : '400' }}>{s.name}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', opacity: showReview ? 1 : 0.5 }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: showReview ? 'white' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: showReview ? '#0F4C81' : 'white', flexShrink: 0 }}>
            {steps.length + 1}
          </div>
          <span style={{ fontSize: '12px', color: showReview ? 'white' : '#a0c4e8', fontWeight: showReview ? '600' : '400' }}>Review & Complete</span>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#a0c4e8', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>← Dashboard</button>
        </div>
      </div>

      {/* Main Content */}
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
    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Procure to Pay</span>
  </div>
  <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>☰</button>
</div>
<div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #e0e4ea' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                Dashboard → Process Explorer → Procure to Pay → {step.code} {step.name}
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>
                Step {currentStep + 1} of {steps.length} — {step.name}
              </h1>
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

              {/* Tool Usage */}
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
                  <input type="text" placeholder="e.g. SAP Ariba, Coupa, Oracle Fusion, Basware, Concur..." value={toolAnswers[step.code]?.tools || ''} onChange={e => updateTools(step.code, e.target.value)} style={inputStyle} />
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>This helps us assess your procurement technology maturity.</div>
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
                      {['CFO / Finance Director', 'Financial Controller', 'Procurement Director / Manager', 'Accounts Payable Manager', 'Accounts Payable Clerk', 'Purchasing Manager / Buyer', 'Treasury Analyst', 'Tax Manager', 'Business Partner', 'Budget Holder / Cost Centre Manager', 'Warehouse / Goods Receiving Team', 'ERP/Systems Administrator', 'IT Manager', 'Data Analyst / BI Developer', 'External Auditor', 'Outsourced Provider / Shared Service'].map(role => (
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
                    <textarea placeholder="e.g. AP team is shared with the broader Finance function..." value={effortData[step.code]?.comments || ''} onChange={e => setEffortData(prev => ({ ...prev, [step.code]: { ...prev[step.code], headcount: prev[step.code]?.headcount || 0, roles: prev[step.code]?.roles || [], hoursPerCycle: prev[step.code]?.hoursPerCycle || 0, comments: e.target.value } }))} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', width: '100%', minHeight: '80px', resize: 'vertical', color: '#333', background: 'white' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #e0e4ea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
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
                  <button onClick={() => saveToSupabase(false).then(() => setCurrentStep(currentStep + 1))} style={{ padding: '10px 24px', background: '#1d9e75', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
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
    </>
  )
}

export default function AssessmentPtPPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssessmentPtPPage />
    </Suspense>
  )
}
