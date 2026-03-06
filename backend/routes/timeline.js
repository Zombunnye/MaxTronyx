const express = require("express")
const router = express.Router()
const fs = require("fs")

const timelineFile = "./data/timeline.json"

router.get("/", (req, res) => {
  const timeline = JSON.parse(fs.readFileSync(timelineFile, "utf8"))

  const sorted = timeline.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )

  res.json({
    count: sorted.length,
    timeline: sorted
  })
})

router.get("/:hostname", (req, res) => {
  const timeline = JSON.parse(fs.readFileSync(timelineFile, "utf8"))

  const filtered = timeline
    .filter(item => item.hostname === req.params.hostname)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  res.json({
    count: filtered.length,
    timeline: filtered
  })
})

module.exports = router