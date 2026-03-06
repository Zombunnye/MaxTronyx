const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const agentsFile = "./data/agents.json"
const actionLogFile = "./data/action_log.json"
const timelineFile = "./data/timeline.json"

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"))
}

function writeJson(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

function autoIsolateHost(hostname, reason, incidentId = null) {
  if (!hostname) return null

  const agents = readJson(agentsFile)
  const agent = agents.find(a => a.hostname === hostname)

  if (!agent) return null

  if (!agent.isolated) {
    agent.isolated = true
    agent.isolation_reason = reason || "Automatic response"
    agent.updated_at = new Date().toISOString()
    writeJson(agentsFile, agents)
  }

  const actions = readJson(actionLogFile)
  const actionEntry = {
    id: uuidv4(),
    type: "auto_isolate_device",
    hostname,
    reason: reason || "Automatic response",
    incident_id: incidentId,
    created_at: new Date().toISOString()
  }
  actions.push(actionEntry)
  writeJson(actionLogFile, actions)

  const timeline = readJson(timelineFile)
  timeline.push({
    id: uuidv4(),
    hostname,
    type: "auto-response",
    timestamp: new Date().toISOString(),
    context: {
      action: "device_isolated",
      reason: reason || "Automatic response",
      incident_id: incidentId
    }
  })
  writeJson(timelineFile, timeline)

  return actionEntry
}

module.exports = {
  autoIsolateHost
}