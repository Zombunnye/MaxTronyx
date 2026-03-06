const express = require("express")
const router = express.Router()
const fs = require("fs")

const { detectThreat } = require("../controllers/detection")
const { autoIsolateHost } = require("../controllers/response")

const incidentsFile = "./data/incidents.json"

router.post("/", (req, res) => {
  const event = req.body

  const incidents = JSON.parse(fs.readFileSync(incidentsFile, "utf8"))
  const detected = detectThreat(event)

  if (detected.length > 0) {
    detected.forEach((incident) => {
      incidents.push(incident)

      const shouldAutoIsolate =
        incident.severity === "critical" ||
        incident.rule === "CRYPTO_MINER"

      if (shouldAutoIsolate) {
        const actionEntry = autoIsolateHost(
          incident.hostname,
          `Auto-response triggered by ${incident.rule}`,
          incident.id
        )

        if (actionEntry) {
          incident.auto_response.executed = true
          incident.auto_response.executed_at = actionEntry.created_at
          incident.auto_response.result = "device_isolated"
          incident.status = "investigating"
        }
      }
    })

    fs.writeFileSync(incidentsFile, JSON.stringify(incidents, null, 2))

    return res.json({
      message: "Threat detected",
      incidents: detected
    })
  }

  return res.json({
    message: "Event received, no threat detected"
  })
})

module.exports = router