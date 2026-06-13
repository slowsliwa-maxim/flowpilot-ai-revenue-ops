const stageWeights = {
  New: 28,
  Contacted: 36,
  Qualified: 48,
  Proposal: 60,
  Won: 74
};

const sourceWeights = {
  "Partner Referral": 12,
  "Website Demo Form": 10,
  "Webhook Intake": 8,
  "Product Hunt": 7,
  "LinkedIn Campaign": 6,
  "Cold Outreach Reply": 5
};

const sizeWeights = {
  "10-50": 3,
  "50-200": 6,
  "200-500": 8
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function scoreLead(lead) {
  const budgetFloor = Number((lead.budgetRange || "0").split("-")[0]);
  const budgetScore = Math.min(12, Math.round(budgetFloor / 2000));
  const revenueScore = Math.min(10, Math.round(lead.monthlyRevenuePotential / 1200));
  return Math.min(
    99,
    (stageWeights[lead.stage] || 40) +
      (sourceWeights[lead.source] || 5) +
      (sizeWeights[lead.companySize] || 3) +
      budgetScore +
      revenueScore
  );
}

export function heuristicAnalysis(lead) {
  const score = scoreLead(lead);
  const tone =
    score >= 90
      ? "High-intent buyer with clear automation pain."
      : score >= 75
        ? "Strong opportunity with concrete workflow needs."
        : "Promising lead that needs discovery to confirm urgency.";

  const nextAction =
    score >= 90
      ? "Book a 30-minute discovery call and show a vertical-specific workflow demo."
      : score >= 75
        ? "Send a short proposal outline with dashboard, CRM sync, and AI summary scope."
        : "Follow up with a qualification email and ask about current tooling, KPIs, and timeline.";

  const summary =
    `${lead.company} is looking for a smarter operations workflow across ` +
    `${lead.industry.toLowerCase()} processes. The main needs are ${lead.painPoints.join(", ")}, ` +
    `with likely value in automated intake, pipeline visibility, and AI-assisted summaries.`;

  return {
    score,
    summary,
    nextAction,
    priority: score >= 90 ? "Critical" : score >= 75 ? "High" : "Medium",
    commercialFit:
      `Estimated monthly opportunity: ${formatMoney(lead.monthlyRevenuePotential)}. ` +
      `Budget signal: ${formatMoney(Number((lead.budgetRange || "0").split("-")[0]))}+`,
    tone
  };
}

export function buildOverview(leads, workflowRuns) {
  const totalLeads = leads.length;
  const qualified = leads.filter((lead) =>
    ["Qualified", "Proposal", "Won"].includes(lead.stage)
  ).length;
  const won = leads.filter((lead) => lead.stage === "Won").length;
  const avgResponseTime =
    leads.reduce((acc, lead) => acc + lead.responseTimeMinutes, 0) / totalLeads;
  const automationMinutes = workflowRuns.reduce((acc, run) => acc + run.savedMinutes, 0);
  const pipelineValue = leads.reduce(
    (acc, lead) => acc + lead.monthlyRevenuePotential * (scoreLead(lead) / 100),
    0
  );

  const stageCounts = ["New", "Contacted", "Qualified", "Proposal", "Won"].map((stage) => ({
    stage,
    count: leads.filter((lead) => lead.stage === stage).length
  }));

  const topLead = [...leads]
    .map((lead) => ({ ...lead, ai: heuristicAnalysis(lead) }))
    .sort((a, b) => b.ai.score - a.ai.score)[0];

  return {
    metrics: [
      {
        label: "Pipeline Health",
        value: `${Math.round((qualified / totalLeads) * 100)}%`,
        detail: `${qualified} of ${totalLeads} leads are qualified or beyond`
      },
      {
        label: "Projected MRR",
        value: formatMoney(Math.round(pipelineValue)),
        detail: "Weighted by AI lead score and current stage"
      },
      {
        label: "Avg Response Time",
        value: `${Math.round(avgResponseTime)} min`,
        detail: "From lead intake to first owner response"
      },
      {
        label: "Automation Time Saved",
        value: `${automationMinutes} min`,
        detail: "Across webhook, AI qualification, digest, and CRM sync"
      }
    ],
    stageCounts,
    won,
    totalLeads,
    topLead: {
      company: topLead.company,
      owner: topLead.owner,
      score: topLead.ai.score,
      priority: topLead.ai.priority,
      summary: topLead.ai.summary,
      nextAction: topLead.ai.nextAction
    }
  };
}

export function buildWeeklyDigest(leads, workflowRuns) {
  const overview = buildOverview(leads, workflowRuns);
  const highPriority = leads
    .map((lead) => ({ ...lead, ai: heuristicAnalysis(lead) }))
    .filter((lead) => lead.ai.score >= 85)
    .sort((a, b) => b.ai.score - a.ai.score)
    .slice(0, 3);

  const slowLeads = leads
    .filter((lead) => lead.responseTimeMinutes > 40)
    .map((lead) => `${lead.company} (${lead.responseTimeMinutes} min)`);

  return {
    generatedAt: new Date().toISOString(),
    headline:
      `Pipeline is healthy with ${overview.totalLeads} active leads and ` +
      `${overview.won} closed-won ${overview.won === 1 ? "opportunity" : "opportunities"}.`,
    insights: [
      `Top opportunity: ${overview.topLead.company} is rated ${overview.topLead.priority.toLowerCase()} priority.`,
      `Automation saved ${workflowRuns.reduce((acc, run) => acc + run.savedMinutes, 0)} minutes this week.`,
      slowLeads.length
        ? `Leads needing faster response: ${slowLeads.join(", ")}.`
        : "No response-time anomalies detected."
    ],
    actions: highPriority.map((lead) => ({
      company: lead.company,
      score: lead.ai.score,
      nextAction: lead.ai.nextAction
    }))
  };
}
