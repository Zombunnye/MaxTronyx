const express = require("express")
const router = express.Router()
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")
const { updateAllHostRiskScores } = require("../controllers/risk")

const agentsFile = "./data/agents.json"

function readAgents() {
  return JSON.parse(fs.readFileSync(agentsFile, "utf8"))
}

function writeAgents(data) {
  fs.writeFileSync(agentsFile, JSON.stringify(data, null, 2))
}

router.get("/", (req, res) => {
  const agents = updateAllHostRiskScores()

  res.json({
    count: agents.length,
    agents
  })
})

router.post("/register", (req, res) => {
  const agents = readAgents()

  const existingAgent = agents.find(
    agent => agent.hostname === req.body.hostname && agent.ip === req.body.ip
  )

  if (existingAgent) {
    existingAgent.last_seen = new Date().toISOString()
    existingAgent.status = "online"

    writeAgents(agents)

    return res.json({
      message: "Agent already registered, updated last_seen",
      agent: existingAgent
    })
  }

  const newAgent = {
    id: uuidv4(),
    hostname: req.body.hostname || "unknown-host",
    ip: req.body.ip || "127.0.0.1",
    created_at: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    status: "online",
    isolated: false,
    risk_score: 0,
    risk_level: "low"
  }

  agents.push(newAgent)
  writeAgents(agents)

  return res.json({
    message: "Agent registered",
    agent: newAgent
  })
})

module.exports = router