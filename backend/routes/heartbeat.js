const express = require("express")
const router = express.Router()
const fs = require("fs")

const agentsFile = "./data/agents.json"

function readAgents() {
  return JSON.parse(fs.readFileSync(agentsFile, "utf8"))
}

function writeAgents(data) {
  fs.writeFileSync(agentsFile, JSON.stringify(data, null, 2))
}

router.post("/", (req, res) => {

  const agents = readAgents()

  const agent = agents.find(a => a.hostname === req.body.hostname)

  if (agent) {

    agent.last_seen = new Date().toISOString()
    agent.status = "online"

    writeAgents(agents)

    return res.json({
      message: "Heartbeat received"
    })
  }

  res.json({
    message: "Agent not registered"
  })

})

module.exports = router