const express = require("express")
const router = express.Router()
const fs = require("fs")

const incidentsFile = "./data/incidents.json"

function readIncidents() {
  return JSON.parse(fs.readFileSync(incidentsFile, "utf8"))
}

function writeIncidents(data) {
  fs.writeFileSync(incidentsFile, JSON.stringify(data, null, 2))
}

router.get("/", (req, res) => {
  const incidents = readIncidents()

  const sortedIncidents = incidents.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  res.json({
    count: sortedIncidents.length,
    incidents: sortedIncidents
  })
})

router.get("/:id", (req, res) => {
  const incidents = readIncidents()
  const incident = incidents.find(item => item.id === req.params.id)

  if (!incident) {
    return res.status(404).json({
      message: "Incident not found"
    })
  }

  return res.json({
    incident
  })
})

router.patch("/:id", (req, res) => {
  const incidents = readIncidents()
  const incident = incidents.find(item => item.id === req.params.id)

  if (!incident) {
    return res.status(404).json({
      message: "Incident not found"
    })
  }

  const allowedStatuses = ["open", "investigating", "closed"]
  const newStatus = req.body.status

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({
      message: "Invalid status"
    })
  }

  incident.status = newStatus
  incident.updated_at = new Date().toISOString()

  writeIncidents(incidents)

  return res.json({
    message: "Incident updated",
    incident
  })
})

module.exports = router