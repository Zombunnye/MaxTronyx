const fs = require("fs");
const path = require("path");

const incidentsFile = path.join(__dirname, "..", "data", "incidents.json");

const SEVERITY_WEIGHTS = {
  low: 10,
  medium: 25,
  high: 50,
  critical: 90,
};

const TYPE_WEIGHTS = {
  suspicious_powershell: 20,
  malicious_script_execution: 30,
  possible_ransomware_activity: 80,
  endpoint_ransomware: 80,
  suspicious_remote_activity: 30,
  privilege_escalation_detected: 40,
  privilege_escalation: 40,
  brute_force_attempt: 25,
  credential_access: 35,
  malware_execution: 45,
};

const STATUS_MULTIPLIER = {
  open: 1,
  investigating: 0.9,
  contained: 0.6,
  resolved: 0.25,
  closed: 0.1,
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function readIncidents() {
  try {
    if (!fs.existsSync(incidentsFile)) {
      return [];
    }

    const raw = fs.readFileSync(incidentsFile, "utf-8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read incidents.json:", error.message);
    return [];
  }
}

function getSeverityWeight(severity) {
  return SEVERITY_WEIGHTS[normalize(severity)] || 15;
}

function getTypeWeight(type, title) {
  const normalizedType = normalize(type);
  if (TYPE_WEIGHTS[normalizedType]) {
    return TYPE_WEIGHTS[normalizedType];
  }

  const normalizedTitle = normalize(title);

  if (normalizedTitle.includes("ransomware")) return 80;
  if (normalizedTitle.includes("privilege")) return 40;
  if (normalizedTitle.includes("powershell")) return 20;
  if (normalizedTitle.includes("remote")) return 30;
  if (normalizedTitle.includes("malware")) return 45;
  if (normalizedTitle.includes("credential")) return 35;

  return 10;
}

function getStatusMultiplier(status) {
  return STATUS_MULTIPLIER[normalize(status)] || 1;
}

function getRiskBand(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function buildIncidentContribution(incident) {
  const severityScore = getSeverityWeight(incident.severity);
  const typeScore = getTypeWeight(incident.type, incident.title);
  const multiplier = getStatusMultiplier(incident.status);

  const rawScore = severityScore + typeScore;
  const weightedScore = Math.round(rawScore * multiplier);

  return {
    incident_id: incident.id || null,
    title: incident.title || "Unknown incident",
    severity: incident.severity || "unknown",
    status: incident.status || "open",
    type: incident.type || "unknown",
    score: weightedScore,
    breakdown: {
      severityScore,
      typeScore,
      multiplier,
    },
    created_at: incident.created_at || null,
  };
}

function calculateHostRiskScores(incidents) {
  const hostMap = new Map();

  for (const incident of incidents) {
    const hostId =
      incident.related_device ||
      incident.device_id ||
      incident.hostname ||
      "unknown-host";

    if (!hostMap.has(hostId)) {
      hostMap.set(hostId, {
        host_id: hostId,
        total_score: 0,
        open_incidents: 0,
        critical_incidents: 0,
        latest_activity: null,
        incidents: [],
        top_contributors: [],
      });
    }

    const host = hostMap.get(hostId);
    const contribution = buildIncidentContribution(incident);

    host.total_score += contribution.score;
    host.incidents.push(contribution);

    if (normalize(incident.status) === "open") {
      host.open_incidents += 1;
    }

    if (normalize(incident.severity) === "critical") {
      host.critical_incidents += 1;
    }

    if (
      incident.created_at &&
      (!host.latest_activity ||
        new Date(incident.created_at) > new Date(host.latest_activity))
    ) {
      host.latest_activity = incident.created_at;
    }
  }

  return Array.from(hostMap.values())
    .map((host) => {
      host.total_score = Math.min(host.total_score, 100);
      host.risk_band = getRiskBand(host.total_score);

      host.top_contributors = [...host.incidents]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return {
        host_id: host.host_id,
        total_score: host.total_score,
        open_incidents: host.open_incidents,
        critical_incidents: host.critical_incidents,
        latest_activity: host.latest_activity,
        risk_band: host.risk_band,
        top_contributors: host.top_contributors,
      };
    })
    .sort((a, b) => b.total_score - a.total_score);
}

function getHostRiskScores(req, res) {
  try {
    const incidents = readIncidents();
    const hosts = calculateHostRiskScores(incidents);

    res.json({
      success: true,
      count: hosts.length,
      hosts,
    });
  } catch (error) {
    console.error("Failed to calculate host risk scores:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate host risk scores",
    });
  }
}

module.exports = {
  getHostRiskScores,
};