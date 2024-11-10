const express = require("express");

const {
  createSchoolTour,
  createIndividualTour,
  getEvent,
  getAllEvents,
  destroyEvent,
} = require("../controllers/EventController");

const auth = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/:id",auth,getEvent)
router.get("/", auth, getAllEvents); // Fetch all school tours
router.delete("/:id", auth, destroyEvent); // Delete a specific school tour by ID

// School Tours routes
router.post("/schooltours", createSchoolTour); // Create a new school tour (not protected)

// Individual Tours routes
router.post("/individualtours", createIndividualTour); // Create a new individual tour (not protected)
module.exports = router;
