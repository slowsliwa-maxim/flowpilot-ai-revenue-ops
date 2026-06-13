const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function metricCard(metric) {
  return `
    <article class="metric">
      <div class="metric__label">${metric.label}</div>
      <div class="metric__value">${metric.value}</div>
      <div class="metric__detail">${metric.detail}</div>
    </article>
  `;
}

function renderOverview(data) {
  const metrics = document.getElementById("metrics");
  metrics.innerHTML = data.metrics.map(metricCard).join("");

  document.getElementById("top-lead-company").textContent = data.topLead.company;
  document.getElementById("top-lead-summary").textContent = data.topLead.summary;
  document.getElementById("top-lead-priority").textContent = `${data.topLead.priority} priority`;
  document.getElementById("top-lead-score").textContent = `AI score ${data.topLead.score}`;

  const maxCount = Math.max(...data.stageCounts.map((item) => item.count), 1);
  document.getElementById("funnel").innerHTML = data.stageCounts
    .map(
      (item) => `
      <div class="funnel-row">
        <div class="funnel-row__meta">
          <span>${item.stage}</span>
          <strong>${item.count}</strong>
        </div>
        <div class="bar"><span style="width:${(item.count / maxCount) * 100}%"></span></div>
      </div>
    `
    )
    .join("");
}

function renderDigest(digest) {
  document.getElementById("digest-headline").textContent = digest.headline;
  document.getElementById("digest-insights").innerHTML = digest.insights
    .map((item) => `<li>${item}</li>`)
    .join("");

  document.getElementById("digest-actions").innerHTML = digest.actions
    .map(
      (action) => `
      <div>
        <strong>${action.company}</strong>
        <div class="muted">Score ${action.score}</div>
        <div>${action.nextAction}</div>
      </div>
    `
    )
    .join("");
}

function renderLeads(leads) {
  const tbody = document.getElementById("leads-table");
  tbody.innerHTML = leads
    .map(
      (lead) => `
      <tr>
        <td>
          <strong>${lead.company}</strong>
          <div class="muted">${lead.industry} • ${lead.country}</div>
        </td>
        <td><span class="stage-pill">${lead.stage}</span></td>
        <td>${lead.source}</td>
        <td><span class="score-pill">${lead.ai.score}</span></td>
        <td>${currency.format(lead.monthlyRevenuePotential)}</td>
        <td><button class="tiny-button" data-lead-id="${lead.id}">Analyze</button></td>
      </tr>
    `
    )
    .join("");
}

function renderWorkflows(runs) {
  document.getElementById("workflow-list").innerHTML = runs
    .map(
      (run) => `
      <div class="timeline-item">
        <div class="timeline-item__meta">
          <span>${run.type} • ${run.source}</span>
          <span>${new Date(run.createdAt).toLocaleString()}</span>
        </div>
        <strong>${run.status}</strong>
        <div>${run.details}</div>
        <div class="muted">${run.savedMinutes} min saved</div>
      </div>
    `
    )
    .join("");
}

function renderAiPanel(analysis, lead) {
  document.getElementById("ai-panel").innerHTML = `
    <div class="ai-card">
      <h3>${lead.company}</h3>
      <div class="ai-card__meta">
        <span class="score-pill">Score ${analysis.score}</span>
        <span class="stage-pill">${analysis.priority}</span>
        <span class="muted">${analysis.mode}</span>
      </div>
      <p><strong>Summary:</strong> ${analysis.summary}</p>
      <p><strong>Commercial fit:</strong> ${analysis.commercialFit}</p>
      <p><strong>Tone:</strong> ${analysis.tone}</p>
      <p><strong>Next action:</strong> ${analysis.nextAction}</p>
    </div>
  `;
}

async function loadDashboard() {
  const [{ overview }, { leads }, { workflowRuns }, { digest }] = await Promise.all([
    fetchJson("/api/overview"),
    fetchJson("/api/leads"),
    fetchJson("/api/workflows"),
    fetchJson("/api/reports/weekly")
  ]);

  renderOverview(overview);
  renderDigest(digest);
  renderLeads(leads);
  renderWorkflows(workflowRuns);

  document.querySelectorAll("[data-lead-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const lead = leads.find((item) => item.id === button.dataset.leadId);
      const { analysis } = await fetchJson(`/api/leads/${lead.id}/analyze`, {
        method: "POST"
      });
      renderAiPanel(analysis, lead);
      const workflows = await fetchJson("/api/workflows");
      renderWorkflows(workflows.workflowRuns);
    });
  });
}

document.getElementById("run-demo").addEventListener("click", async () => {
  await fetchJson("/api/automation/run-demo", { method: "POST" });
  await loadDashboard();
});

loadDashboard().catch((error) => {
  document.getElementById("metrics").innerHTML = `
    <article class="metric"><div class="metric__label">Error</div><div class="metric__value">API failed</div><div class="metric__detail">${error.message}</div></article>
  `;
});
