const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

// Destructure the required functions from the controller
const {
  createSchoolTour,
  createIndividualTour,
  createFair,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  assignAdvisorToTour,
  assignGuideToEvent,
} = require("../controllers/EventController");

// Routes for creating events
router.post("/schooltours", auth, createSchoolTour);
router.post("/individualtours", auth, createIndividualTour);
router.post("/fairs", auth, createFair);

// Routes for fetching events
router.get("/", auth, getAllEvents);
router.get("/:id", auth, getEvent);

// Routes for updating and deleting events
router.put("/:eventId", auth, updateEvent);
router.delete("/:eventId", auth, deleteEvent);

// Routes for assigning roles
router.post("/assign-advisor", auth, assignAdvisorToTour);
router.post("/assign-guide", auth, assignGuideToEvent);

module.exports = router;
