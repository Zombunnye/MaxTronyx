const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

const agents = require("./routes/agents")
const incidents = require("./routes/incidents")
const events = require("./routes/events")
const heartbeat = require("./routes/heartbeat")
const actions = require("./routes/actions")
const timeline = require("./routes/timeline")
const live = require("./routes/live")
const riskRoutes = require("./routes/risk");

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/v1/agents", agents)
app.use("/api/v1/incidents", incidents)
app.use("/api/v1/events", events)
app.use("/api/v1/heartbeat", heartbeat)
app.use("/api/v1/actions", actions)
app.use("/api/v1/timeline", timeline)
app.use("/api/v1/live", live)
app.use("/api/v1/risk", riskRoutes);

app.use("/dashboard", express.static(path.join(__dirname, "..", "dashboard")))

app.get("/", (req, res) => {
  res.redirect("/dashboard")
})

app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "MaxTronyx backend running"
  })
})

const PORT = 4000

app.listen(PORT, () => {
  console.log(`MaxTronyx server running on port ${PORT}`)
})