const express = require("express")
const router = express.Router()
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const actionLogFile = "./data/action_log.json"
const agentsFile = "./data/agents.json"

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"))
}

function writeJson(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

router.post("/isolate", (req, res) => {
  const { hostname, reason } = req.body

  if (!hostname) {
    return res.status(400).json({
      message: "hostname is required"
    })
  }

  const agents = readJson(agentsFile)
  const agent = agents.find(a => a.hostname === hostname)

  if (!agent) {
    return res.status(404).json({
      message: "Agent not found"
    })
  }

  agent.isolated = true
  agent.isolation_reason = reason || "Manual SOC isolation"
  agent.updated_at = new Date().toISOString()

  writeJson(agentsFile, agents)

  const log = readJson(actionLogFile)

  const actionEntry = {
    id: uuidv4(),
    type: "isolate_device",
    hostname,
    reason: reason || "Manual SOC isolation",
    created_at: new Date().toISOString()
  }

  log.push(actionEntry)
  writeJson(actionLogFile, log)

  return res.json({
    message: "Device isolation simulated successfully",
    action: actionEntry,
    agent
  })
})

router.get("/log", (req, res) => {
  const log = readJson(actionLogFile)
  const sortedLog = log.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  res.json({
    count: sortedLog.length,
    actions: sortedLog
  })
})

module.exports = router