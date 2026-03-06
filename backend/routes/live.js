const express = require("express")
const router = express.Router()
const fs = require("fs")

const incidentsFile = "./data/incidents.json"

router.get("/", (req, res) => {

  const incidents = JSON.parse(fs.readFileSync(incidentsFile))

  const sorted = incidents
    .sort((a,b)=> new Date(b.created_at) - new Date(a.created_at))
    .slice(0,10)

  const feed = sorted.map(i => ({
    time: i.created_at,
    title: i.title,
    severity: i.severity,
    host: i.hostname || "unknown-host"
  }))

  res.json({
    feed
  })

})

module.exports = router