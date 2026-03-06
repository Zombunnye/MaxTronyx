const express = require("express");
const router = express.Router();

const { getHostRiskScores } = require("../controllers/risk");

router.get("/hosts", getHostRiskScores);

module.exports = router;