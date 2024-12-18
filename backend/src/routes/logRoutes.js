const express = require("express");
const { getLogs } = require("../controllers/LogController");
const router = express.Router();

router.get("/", getLogs);

module.exports = router;