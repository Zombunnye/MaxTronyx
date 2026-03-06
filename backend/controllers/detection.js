const { v4: uuidv4 } = require("uuid")
const fs = require("fs")

const timelineFile = "./data/timeline.json"

function saveTimeline(event, mitre = null) {
  const timeline = JSON.parse(fs.readFileSync(timelineFile, "utf8"))

  timeline.push({
    id: uuidv4(),
    hostname: event.hostname || "unknown",
    type: event.type || event.process || "event",
    timestamp: new Date().toISOString(),
    mitre,
    context: event
  })

  fs.writeFileSync(timelineFile, JSON.stringify(timeline, null, 2))
}

function detectThreat(event) {
  const incidents = []

  if (event.type === "ransomware" || event.files_changed > 100) {
    const mitre = {
      technique: "T1486",
      name: "Data Encrypted for Impact"
    }

    saveTimeline(event, mitre)

    incidents.push({
      id: uuidv4(),
      title: "Possible ransomware activity detected",
      severity: "critical",
      rule: "RANSOMWARE_FILE_ENCRYPTION",
      mitre,
      source: "endpoint-agent",
      hostname: event.hostname || "unknown-host",
      status: "open",
      auto_response: {
        recommended: true,
        action: "isolate_device"
      },
      created_at: new Date().toISOString(),
      context: event
    })
  }

  if (event.process && event.process.toLowerCase().includes("powershell")) {
    const mitre = {
      technique: "T1059",
      name: "Command and Scripting Interpreter"
    }

    saveTimeline(event, mitre)

    incidents.push({
      id: uuidv4(),
      title: "Suspicious PowerShell execution",
      severity: "high",
      rule: "POWERSHELL_ABUSE",
      mitre,
      source: "endpoint-agent",
      hostname: event.hostname || "unknown-host",
      status: "open",
      auto_response: {
        recommended: false,
        action: "monitor"
      },
      created_at: new Date().toISOString(),
      context: event
    })
  }

  if (event.process && event.process.toLowerCase().includes("xmrig")) {
    const mitre = {
      technique: "T1496",
      name: "Resource Hijacking"
    }

    saveTimeline(event, mitre)

    incidents.push({
      id: uuidv4(),
      title: "Possible crypto miner detected",
      severity: "high",
      rule: "CRYPTO_MINER",
      mitre,
      source: "endpoint-agent",
      hostname: event.hostname || "unknown-host",
      status: "open",
      auto_response: {
        recommended: true,
        action: "isolate_device"
      },
      created_at: new Date().toISOString(),
      context: event
    })
  }

  if (event.failed_logins && event.failed_logins > 10) {
    const mitre = {
      technique: "T1110",
      name: "Brute Force"
    }

    saveTimeline(event, mitre)

    incidents.push({
      id: uuidv4(),
      title: "Multiple failed login attempts",
      severity: "medium",
      rule: "BRUTE_FORCE",
      mitre,
      source: "endpoint-agent",
      hostname: event.hostname || "unknown-host",
      status: "open",
      auto_response: {
        recommended: false,
        action: "investigate"
      },
      created_at: new Date().toISOString(),
      context: event
    })
  }

  return incidents
}

module.exports = {
  detectThreat
}