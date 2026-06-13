export const leads = [
  {
    id: "lead-101",
    name: "Sarah Coleman",
    company: "Northbeam Logistics",
    source: "Website Demo Form",
    industry: "Logistics",
    country: "United Kingdom",
    budgetRange: "12000-18000",
    companySize: "50-200",
    monthlyRevenuePotential: 6400,
    stage: "Qualified",
    owner: "Sales Ops",
    responseTimeMinutes: 18,
    submittedAt: "2026-06-09T09:12:00Z",
    message:
      "We need a central place to capture inbound leads, automate follow-ups, and send weekly growth reports to leadership.",
    painPoints: ["manual follow-up", "no unified dashboard", "slow reporting"]
  },
  {
    id: "lead-102",
    name: "Luis Ferreira",
    company: "Casa Verde Retail",
    source: "LinkedIn Campaign",
    industry: "Retail",
    country: "Portugal",
    budgetRange: "5000-9000",
    companySize: "10-50",
    monthlyRevenuePotential: 2800,
    stage: "New",
    owner: "Growth",
    responseTimeMinutes: 54,
    submittedAt: "2026-06-10T14:45:00Z",
    message:
      "We want to automate lead routing and understand which marketing channels generate the best conversion.",
    painPoints: ["messy attribution", "manual lead routing", "inconsistent reporting"]
  },
  {
    id: "lead-103",
    name: "Nina Volkov",
    company: "Aster Med Partners",
    source: "Partner Referral",
    industry: "Healthcare",
    country: "Germany",
    budgetRange: "20000-30000",
    companySize: "200-500",
    monthlyRevenuePotential: 9800,
    stage: "Proposal",
    owner: "Founder",
    responseTimeMinutes: 12,
    submittedAt: "2026-06-11T08:30:00Z",
    message:
      "Our commercial team needs AI summaries of inbound requests, CRM synchronization, and SLA visibility across regions.",
    painPoints: ["CRM sync gaps", "slow qualification", "limited SLA tracking"]
  },
  {
    id: "lead-104",
    name: "James Pritchard",
    company: "BlueHarbor Energy",
    source: "Webhook Intake",
    industry: "Energy",
    country: "Ireland",
    budgetRange: "15000-24000",
    companySize: "50-200",
    monthlyRevenuePotential: 7200,
    stage: "Qualified",
    owner: "Automation",
    responseTimeMinutes: 21,
    submittedAt: "2026-06-11T16:10:00Z",
    message:
      "We want an internal operations dashboard that combines inbound requests, status updates, and automated executive summaries.",
    painPoints: ["scattered updates", "manual status emails", "no single source of truth"]
  },
  {
    id: "lead-105",
    name: "Mei Chen",
    company: "Atlas Commerce",
    source: "Product Hunt",
    industry: "Ecommerce",
    country: "Singapore",
    budgetRange: "8000-14000",
    companySize: "10-50",
    monthlyRevenuePotential: 4100,
    stage: "Contacted",
    owner: "Growth",
    responseTimeMinutes: 27,
    submittedAt: "2026-06-12T06:05:00Z",
    message:
      "Looking for AI-powered support triage, funnel analytics, and workflow automation between the storefront and CRM.",
    painPoints: ["support overload", "unclear funnel visibility", "manual CRM updates"]
  },
  {
    id: "lead-106",
    name: "Daniel Foster",
    company: "FieldGrid Services",
    source: "Cold Outreach Reply",
    industry: "Field Services",
    country: "Canada",
    budgetRange: "9000-16000",
    companySize: "50-200",
    monthlyRevenuePotential: 5200,
    stage: "Won",
    owner: "Founder",
    responseTimeMinutes: 14,
    submittedAt: "2026-06-12T11:25:00Z",
    message:
      "Interested in replacing spreadsheets with a dashboard that tracks jobs, lead quality, and sales follow-up automation.",
    painPoints: ["spreadsheet chaos", "low visibility", "slow follow-up"]
  }
];

export const workflowRuns = [
  {
    id: "run-901",
    type: "Lead Intake",
    source: "n8n webhook",
    status: "Completed",
    savedMinutes: 24,
    createdAt: "2026-06-12T11:29:00Z",
    details: "Lead created, Slack alert sent, CRM upsert finished."
  },
  {
    id: "run-902",
    type: "AI Qualification",
    source: "AI agent",
    status: "Completed",
    savedMinutes: 17,
    createdAt: "2026-06-12T11:31:00Z",
    details: "Priority score, summary, and next action generated."
  },
  {
    id: "run-903",
    type: "Weekly Digest",
    source: "Scheduler",
    status: "Completed",
    savedMinutes: 41,
    createdAt: "2026-06-12T17:00:00Z",
    details: "Digest sent to founders with pipeline and anomaly notes."
  },
  {
    id: "run-904",
    type: "CRM Sync",
    source: "Background sync",
    status: "Needs review",
    savedMinutes: 8,
    createdAt: "2026-06-13T08:10:00Z",
    details: "One opportunity had a missing owner mapping."
  }
];

export const stageTargets = [
  { stage: "New", current: 8, target: 12 },
  { stage: "Qualified", current: 5, target: 6 },
  { stage: "Proposal", current: 3, target: 4 },
  { stage: "Won", current: 2, target: 2 }
];
