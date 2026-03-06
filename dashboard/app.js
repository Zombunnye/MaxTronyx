const totalAgentsEl = document.getElementById("totalAgents")
const onlineAgentsEl = document.getElementById("onlineAgents")
const totalIncidentsEl = document.getElementById("totalIncidents")
const criticalIncidentsEl = document.getElementById("criticalIncidents")

const agentsTableBody = document.getElementById("agentsTableBody")
const incidentsTableBody = document.getElementById("incidentsTableBody")
const actionsTableBody = document.getElementById("actionsTableBody")
const timelineContainer = document.getElementById("timelineContainer")
const liveFeedContainer = document.getElementById("liveFeed")

const agentsCountBadge = document.getElementById("agentsCountBadge")
const incidentsCountBadge = document.getElementById("incidentsCountBadge")
const actionsCountBadge = document.getElementById("actionsCountBadge")
const timelineCountBadge = document.getElementById("timelineCountBadge")

const hostRiskTableBody = document.getElementById("hostRiskTableBody")
const hostRiskCountBadge = document.getElementById("hostRiskCountBadge")

const refreshBtn = document.getElementById("refreshBtn")

const incidentModal = document.getElementById("incidentModal")
const closeModalBtn = document.getElementById("closeModal")

const modalTitle = document.getElementById("modalTitle")
const modalSeverity = document.getElementById("modalSeverity")
const modalStatus = document.getElementById("modalStatus")
const modalMitre = document.getElementById("modalMitre")
const modalHostname = document.getElementById("modalHostname")
const modalCreated = document.getElementById("modalCreated")
const modalContext = document.getElementById("modalContext")
const modalTimeline = document.getElementById("modalTimeline")

let cachedTimeline = []
let cachedIncidents = []

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function formatDateTime(value) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
}

function getSeverityClass(severity) {
  switch (normalizeText(severity)) {
    case "critical":
      return "critical"
    case "high":
      return "high"
    case "medium":
      return "medium"
    case "low":
      return "low"
    default:
      return "neutral"
  }
}

function getStatusClass(status) {
  switch (normalizeText(status)) {
    case "open":
      return "critical"
    case "investigating":
      return "medium"
    case "contained":
      return "high"
    case "resolved":
    case "closed":
      return "low"
    default:
      return "neutral"
  }
}

function getRiskBadgeClass(riskBand) {
  switch (normalizeText(riskBand)) {
    case "critical":
      return "critical"
    case "high":
      return "high"
    case "medium":
      return "medium"
    case "low":
      return "low"
    default:
      return "neutral"
  }
}

function getAgentStatusClass(status) {
  switch (normalizeText(status)) {
    case "online":
      return "low"
    case "offline":
      return "critical"
    default:
      return "neutral"
  }
}

function getIsolationClass(value) {
  return value ? "critical" : "low"
}

function safeArray(data, fallbackKey = null) {
  if (Array.isArray(data)) return data
  if (fallbackKey && Array.isArray(data?.[fallbackKey])) return data[fallbackKey]
  return []
}

function renderAgents(agents) {
  const safeAgents = safeArray(agents, "agents")

  agentsCountBadge.textContent = `${safeAgents.length} agents`
  totalAgentsEl.textContent = safeAgents.length
  onlineAgentsEl.textContent = safeAgents.filter(
    (agent) => normalizeText(agent.status) === "online"
  ).length

  if (!safeAgents.length) {
    agentsTableBody.innerHTML = `
      <tr>
        <td colspan="7">No agents found</td>
      </tr>
    `
    return
  }

  agentsTableBody.innerHTML = safeAgents.map((agent) => {
    const hostname = agent.hostname || agent.name || "unknown-host"
    const ipAddress = agent.ip || agent.ip_address || "-"
    const status = agent.status || "unknown"
    const isolated = Boolean(agent.isolated || agent.isolation_enabled)
    const risk = agent.risk || agent.risk_band || "low"
    const created = agent.created_at || agent.created || "-"
    const lastSeen = agent.last_seen || agent.lastSeen || "-"

    return `
      <tr>
        <td>${escapeHtml(hostname)}</td>
        <td>${escapeHtml(ipAddress)}</td>
        <td><span class="badge ${getAgentStatusClass(status)}">${escapeHtml(String(status).toUpperCase())}</span></td>
        <td><span class="badge ${getIsolationClass(isolated)}">${isolated ? "ISOLATED" : "NORMAL"}</span></td>
        <td><span class="badge ${getRiskBadgeClass(risk)}">${escapeHtml(String(risk).toUpperCase())}</span></td>
        <td>${escapeHtml(formatDateTime(created))}</td>
        <td>${escapeHtml(formatDateTime(lastSeen))}</td>
      </tr>
    `
  }).join("")
}

function renderIncidents(incidents) {
  const safeIncidents = safeArray(incidents, "incidents")
  cachedIncidents = safeIncidents

  incidentsCountBadge.textContent = `${safeIncidents.length} incidents`
  totalIncidentsEl.textContent = safeIncidents.length
  criticalIncidentsEl.textContent = safeIncidents.filter(
    (incident) => normalizeText(incident.severity) === "critical"
  ).length

  if (!safeIncidents.length) {
    incidentsTableBody.innerHTML = `
      <tr>
        <td colspan="8">No incidents found</td>
      </tr>
    `
    return
  }

  incidentsTableBody.innerHTML = safeIncidents.map((incident) => {
    const title = incident.title || "Unknown incident"
    const severity = incident.severity || "unknown"
    const status = incident.status || "unknown"
    const mitre = incident.rule_id || incident.mitre || incident.mitre_technique || "-"
    const source = incident.related_device || incident.hostname || incident.source || "-"
    const created = incident.created_at || incident.created || "-"
    const context = incident.context ? "Available" : "None"

    return `
      <tr>
        <td>${escapeHtml(title)}</td>
        <td><span class="badge ${getSeverityClass(severity)}">${escapeHtml(String(severity).toUpperCase())}</span></td>
        <td><span class="badge ${getStatusClass(status)}">${escapeHtml(String(status).toUpperCase())}</span></td>
        <td>${escapeHtml(mitre)}</td>
        <td>${escapeHtml(source)}</td>
        <td>${escapeHtml(formatDateTime(created))}</td>
        <td>${escapeHtml(context)}</td>
        <td>
          <button class="action-btn investigate-btn" data-incident-id="${escapeHtml(incident.id || "")}">
            Investigate
          </button>
        </td>
      </tr>
    `
  }).join("")

  bindInvestigateButtons()
}

function renderHostRiskScores(hosts) {
  const safeHosts = safeArray(hosts, "hosts")

  hostRiskCountBadge.textContent = `${safeHosts.length} hosts`

  if (!safeHosts.length) {
    hostRiskTableBody.innerHTML = `
      <tr>
        <td colspan="6">No host risk data available</td>
      </tr>
    `
    return
  }

  hostRiskTableBody.innerHTML = safeHosts.map((host) => {
    return `
      <tr>
        <td>${escapeHtml(host.host_id || "-")}</td>
        <td><strong>${escapeHtml(host.total_score ?? 0)}</strong></td>
        <td><span class="badge ${getRiskBadgeClass(host.risk_band)}">${escapeHtml(String(host.risk_band || "low").toUpperCase())}</span></td>
        <td>${escapeHtml(host.open_incidents ?? 0)}</td>
        <td>${escapeHtml(host.critical_incidents ?? 0)}</td>
        <td>${escapeHtml(formatDateTime(host.latest_activity))}</td>
      </tr>
    `
  }).join("")
}

function renderTimeline(events) {
  const safeEvents = safeArray(events, "timeline")
  cachedTimeline = safeEvents

  timelineCountBadge.textContent = `${safeEvents.length} events`

  if (!safeEvents.length) {
    timelineContainer.innerHTML = `<div class="timeline-item">No timeline events found</div>`
    return
  }

  timelineContainer.innerHTML = safeEvents.map((event) => {
    const timestamp = event.created_at || event.timestamp || event.time || "-"
    const title = event.title || event.event || event.type || "Timeline event"
    const description = event.description || event.details || ""
    const source = event.hostname || event.related_device || event.source || ""

    return `
      <div class="timeline-item">
        <div class="timeline-time">${escapeHtml(formatDateTime(timestamp))}</div>
        <div class="timeline-content">
          <strong>${escapeHtml(title)}</strong>
          ${source ? `<div>${escapeHtml(source)}</div>` : ""}
          ${description ? `<div>${escapeHtml(description)}</div>` : ""}
        </div>
      </div>
    `
  }).join("")
}

function renderLiveFeed(events) {
  const safeEvents = safeArray(events, "events")

  if (!safeEvents.length) {
    liveFeedContainer.innerHTML = `<div class="timeline-item">No live security events found</div>`
    return
  }

  liveFeedContainer.innerHTML = safeEvents.map((event) => {
    const timestamp = event.created_at || event.timestamp || event.time || "-"
    const title = event.title || event.event || event.type || "Security event"
    const description = event.description || event.details || ""
    const source = event.hostname || event.related_device || event.source || ""

    return `
      <div class="timeline-item">
        <div class="timeline-time">${escapeHtml(formatDateTime(timestamp))}</div>
        <div class="timeline-content">
          <strong>${escapeHtml(title)}</strong>
          ${source ? `<div>${escapeHtml(source)}</div>` : ""}
          ${description ? `<div>${escapeHtml(description)}</div>` : ""}
        </div>
      </div>
    `
  }).join("")
}

function renderActions(actions) {
  const safeActions = safeArray(actions, "actions")

  actionsCountBadge.textContent = `${safeActions.length} actions`

  if (!safeActions.length) {
    actionsTableBody.innerHTML = `
      <tr>
        <td colspan="4">No response actions found</td>
      </tr>
    `
    return
  }

  actionsTableBody.innerHTML = safeActions.map((action) => {
    const type = action.type || action.action || "-"
    const hostname = action.hostname || action.related_device || action.device || "-"
    const reason = action.reason || action.description || "-"
    const created = action.created_at || action.timestamp || "-"

    return `
      <tr>
        <td>${escapeHtml(type)}</td>
        <td>${escapeHtml(hostname)}</td>
        <td>${escapeHtml(reason)}</td>
        <td>${escapeHtml(formatDateTime(created))}</td>
      </tr>
    `
  }).join("")
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function loadAgents() {
  const data = await fetchJson("/api/v1/agents")
  renderAgents(data)
}

async function loadIncidents() {
  const data = await fetchJson("/api/v1/incidents")
  renderIncidents(data)
}

async function loadHostRiskScores() {
  const data = await fetchJson("/api/v1/risk/hosts")
  renderHostRiskScores(data)
}

async function loadTimeline() {
  const data = await fetchJson("/api/v1/timeline")
  renderTimeline(data)
}

async function loadLiveFeed() {
  const data = await fetchJson("/api/v1/live")
  renderLiveFeed(data)
}

async function loadActions() {
  const data = await fetchJson("/api/v1/actions")
  renderActions(data)
}

function openIncidentModal(incident) {
  if (!incident) return

  modalTitle.textContent = incident.title || "-"
  modalSeverity.textContent = incident.severity || "-"
  modalStatus.textContent = incident.status || "-"
  modalMitre.textContent = incident.rule_id || incident.mitre || incident.mitre_technique || "-"
  modalHostname.textContent = incident.related_device || incident.hostname || incident.source || "-"
  modalCreated.textContent = formatDateTime(incident.created_at || incident.created || "-")
  modalContext.textContent = JSON.stringify(incident.context || {}, null, 2)

  const relatedTimeline = cachedTimeline.filter((event) => {
    const eventHost = event.related_device || event.hostname || event.source || ""
    const incidentHost = incident.related_device || incident.hostname || incident.source || ""
    return eventHost && incidentHost && eventHost === incidentHost
  })

  if (!relatedTimeline.length) {
    modalTimeline.innerHTML = `<div class="timeline-item">No related timeline events found</div>`
  } else {
    modalTimeline.innerHTML = relatedTimeline.map((event) => {
      const timestamp = event.created_at || event.timestamp || event.time || "-"
      const title = event.title || event.event || event.type || "Timeline event"
      const description = event.description || event.details || ""

      return `
        <div class="timeline-item">
          <div class="timeline-time">${escapeHtml(formatDateTime(timestamp))}</div>
          <div class="timeline-content">
            <strong>${escapeHtml(title)}</strong>
            ${description ? `<div>${escapeHtml(description)}</div>` : ""}
          </div>
        </div>
      `
    }).join("")
  }

  incidentModal.classList.remove("hidden")
}

function closeIncidentModal() {
  incidentModal.classList.add("hidden")
}

function bindInvestigateButtons() {
  const buttons = document.querySelectorAll(".investigate-btn")

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const incidentId = button.getAttribute("data-incident-id")
      const incident = cachedIncidents.find((item) => String(item.id) === String(incidentId))
      openIncidentModal(incident)
    })
  })
}

async function loadDashboard() {
  try {
    refreshBtn.disabled = true
    refreshBtn.textContent = "Refreshing..."

    await Promise.all([
      loadAgents(),
      loadIncidents(),
      loadHostRiskScores(),
      loadTimeline(),
      loadLiveFeed(),
      loadActions()
    ])
  } catch (error) {
    console.error("Failed to load dashboard:", error)
  } finally {
    refreshBtn.disabled = false
    refreshBtn.textContent = "Refresh Data"
  }
}

refreshBtn?.addEventListener("click", loadDashboard)
closeModalBtn?.addEventListener("click", closeIncidentModal)

window.addEventListener("click", (event) => {
  if (event.target === incidentModal) {
    closeIncidentModal()
  }
})

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeIncidentModal()
  }
})

loadDashboard()