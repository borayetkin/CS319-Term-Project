const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const advisorAuth = require("../middleware/advisorMiddleware");
// Destructure the required functions from the controller
const {
  getAcceptedEvents,
  createSchoolTour,
  createIndividualTour,
  getAllEvents,
  getCompletedEvents: getCompletedNonVerifiedEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  assignAdvisorToTour,
  assignGuideToEvent,
  getEventAssignees,
  getAssigneddEventsOfUser,
  getApplicationsOfAdvisor,
  removeAssignedGuideFromEvent,
  getSchoolTourCountsByMonth,
  markEventAsCancelled,
  markEventAsCompleted,
  takeBackEventAction,
  confirmEventAction,
  applyToEvent,
} = require("../controllers/EventController");
const adminAuth = require("../middleware/adminMiddleware");

// Routes for creating events
router.post("/schooltours", createSchoolTour);
router.post("/individualtours",  createIndividualTour);
// Routes for fetching events
router.get("/", advisorAuth, getAllEvents);
router.get("/accepted", auth, getAcceptedEvents);
router.get("/user", auth, getAssigneddEventsOfUser);
router.get("/advisor", auth, getApplicationsOfAdvisor);
router.get("/completed",auth,getCompletedNonVerifiedEvents);
router.get("/:id", auth, getEvent);

// Add this route to fetch event details by ID
router.get("/details/:id", auth, getEvent); // Assuming `getEvent` handles fetching by ID
router.get("/:id/assignees", auth, getEventAssignees);

// Routes for updating and deleting events
router.put("/:eventId", advisorAuth, updateEvent);
router.delete("/:eventId", advisorAuth, deleteEvent);

router.post("/:eventId/cancel", auth,  markEventAsCancelled);
router.post("/:eventId/complete", auth, markEventAsCompleted);
router.post("/:eventId/take-back", auth, takeBackEventAction);
router.post("/confirm-action/:eventId", advisorAuth, confirmEventAction);
// Routes for assigning roles
router.post("/assign-advisor", auth, assignAdvisorToTour);
router.post("/assign-guide", auth, assignGuideToEvent);
router.post("/apply", auth, applyToEvent);
router.post("/remove-guide", auth, removeAssignedGuideFromEvent);

// Route for fetching application counts on the date&time
router.get("/shcooltours/dates",getSchoolTourCountsByMonth)
module.exports = router;
