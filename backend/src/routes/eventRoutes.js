const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const advisorAuth = require("../middleware/advisorMiddleware")
// Destructure the required functions from the controller
const {
  getAcceptedEvents,
  createSchoolTour,
  createIndividualTour,
  createFair,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  assignAdvisorToTour,
  assignGuideToEvent,
  getEventAssignees,
  getAssigneddEventsOfUser,
  getApplicationsOfAdvisor,
  removeAssignedGuideFromEvent,
  getFairs,
} = require("../controllers/EventController");

// Routes for creating events
router.post("/schooltours", createSchoolTour);
router.post("/individualtours",  createIndividualTour);
router.post("/fairs",createFair);

// Routes for fetching events
router.get("/fairs", auth, getFairs);
router.get("/", advisorAuth, getAllEvents);
router.get("/accepted", auth, getAcceptedEvents);
router.get("/user", auth, getAssigneddEventsOfUser);
router.get("/advisor", auth, getApplicationsOfAdvisor);
router.get("/:id", auth, getEvent);
router.get("/:id/assignees", auth, getEventAssignees);

// Routes for updating and deleting events
router.put("/:eventId", advisorAuth, updateEvent);
router.delete("/:eventId", advisorAuth, deleteEvent);

// Routes for assigning roles
router.post("/assign-advisor", auth, assignAdvisorToTour);
router.post("/assign-guide", auth, assignGuideToEvent);
router.post("/remove-guide", auth, removeAssignedGuideFromEvent);


module.exports = router;
