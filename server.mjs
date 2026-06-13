import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { leads as seedLeads, workflowRuns as seedWorkflowRuns, stageTargets } from "./lib/demo-data.mjs";
import { buildOverview, buildWeeklyDigest, heuristicAnalysis } from "./lib/insights.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = normalize(join(__filename, ".."));
const publicDir = join(__dirname, "public");

const db = {
  leads: structuredClone(seedLeads),
  workflowRuns: structuredClone(seedWorkflowRuns)
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

function safePath(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) return null;
  return filePath;
}

function createWorkflowRun(type, source, status, savedMinutes, details) {
  const run = {
    id: `run-${Date.now()}`,
    type,
    source,
    status,
    savedMinutes,
    createdAt: new Date().toISOString(),
    details
  };
  db.workflowRuns.unshift(run);
  return run;
}

async function maybeGenerateAiAnalysis(lead) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ...heuristicAnalysis(lead), mode: "heuristic" };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are a sales operations AI. Return compact JSON with keys summary, nextAction, priority, commercialFit, tone."
          },
          {
            role: "user",
            content: JSON.stringify(lead)
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "lead_analysis",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: { type: "string" },
                nextAction: { type: "string" },
                priority: { type: "string" },
                commercialFit: { type: "string" },
                tone: { type: "string" }
              },
              required: ["summary", "nextAction", "priority", "commercialFit", "tone"]
            }
          }
        }
      })
    });

    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
    const result = await response.json();
    const text = result.output?.[0]?.content?.[0]?.text || "{}";
    const parsed = JSON.parse(text);
    const fallback = heuristicAnalysis(lead);
    return {
      ...fallback,
      ...parsed,
      mode: "openai"
    };
  } catch {
    return { ...heuristicAnalysis(lead), mode: "heuristic-fallback" };
  }
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/overview") {
    return sendJson(res, 200, {
      overview: buildOverview(db.leads, db.workflowRuns),
      stageTargets
    });
  }

  if (req.method === "GET" && pathname === "/api/leads") {
    const leads = db.leads
      .map((lead) => ({
        ...lead,
        ai: heuristicAnalysis(lead)
      }))
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return sendJson(res, 200, { leads });
  }

  if (req.method === "GET" && pathname === "/api/workflows") {
    return sendJson(res, 200, { workflowRuns: db.workflowRuns });
  }

  if (req.method === "GET" && pathname === "/api/reports/weekly") {
    return sendJson(res, 200, {
      digest: buildWeeklyDigest(db.leads, db.workflowRuns)
    });
  }

  if (req.method === "POST" && pathname === "/api/automation/run-demo") {
    const newLead = {
      id: `lead-${Math.floor(Math.random() * 1000)}`,
      name: "Elena Torres",
      company: "Harborline Finance",
      source: "n8n demo webhook",
      industry: "Finance",
      country: "Spain",
      budgetRange: "14000-22000",
      companySize: "50-200",
      monthlyRevenuePotential: 6800,
      stage: "New",
      owner: "Automation",
      responseTimeMinutes: 9,
      submittedAt: new Date().toISOString(),
      message:
        "Need a sales and operations dashboard with lead qualification, CRM sync, and AI-generated summaries.",
      painPoints: ["manual CRM work", "slow reporting", "no qualification logic"]
    };

    db.leads.unshift(newLead);
    createWorkflowRun(
      "Lead Intake",
      "Demo automation",
      "Completed",
      19,
      "Synthetic lead created for portfolio demo, CRM sync simulated, digest queue updated."
    );

    return sendJson(res, 201, {
      lead: { ...newLead, ai: heuristicAnalysis(newLead) }
    });
  }

  if (req.method === "POST" && pathname === "/api/automation/intake") {
    const body = await parseBody(req);
    const lead = {
      id: `lead-${Date.now()}`,
      name: body.name || "Webhook Lead",
      company: body.company || "Unknown Company",
      source: body.source || "Webhook Intake",
      industry: body.industry || "General",
      country: body.country || "Unknown",
      budgetRange: body.budgetRange || "5000-10000",
      companySize: body.companySize || "10-50",
      monthlyRevenuePotential: Number(body.monthlyRevenuePotential || 2500),
      stage: "New",
      owner: body.owner || "Automation",
      responseTimeMinutes: Number(body.responseTimeMinutes || 15),
      submittedAt: new Date().toISOString(),
      message: body.message || "No message provided.",
      painPoints: Array.isArray(body.painPoints) ? body.painPoints : ["workflow automation"]
    };

    db.leads.unshift(lead);
    createWorkflowRun(
      "Webhook Intake",
      body.source || "n8n webhook",
      "Completed",
      Number(body.savedMinutes || 22),
      `Lead ${lead.company} ingested through webhook payload.`
    );

    return sendJson(res, 201, {
      lead: { ...lead, ai: heuristicAnalysis(lead) }
    });
  }

  if (req.method === "POST" && pathname.startsWith("/api/leads/") && pathname.endsWith("/analyze")) {
    const leadId = pathname.split("/")[3];
    const lead = db.leads.find((item) => item.id === leadId);
    if (!lead) return notFound(res);

    const analysis = await maybeGenerateAiAnalysis(lead);
    createWorkflowRun(
      "AI Qualification",
      analysis.mode === "openai" ? "OpenAI API" : "Local heuristic",
      "Completed",
      12,
      `Lead ${lead.company} analyzed with ${analysis.mode}.`
    );

    return sendJson(res, 200, { analysis });
  }

  return notFound(res);
}

async function handleStatic(req, res, pathname) {
  const filePath = safePath(pathname);
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream"
    });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    return handleApi(req, res, url.pathname);
  }
  return handleStatic(req, res, url.pathname);
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`FlowPilot is running on http://localhost:${port}`);
});
