const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, applicationController.getApplications);
router.put("/:id", auth, applicationController.updateApplicationStatus);

module.exports = router;
