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
  updateEventTwo,
  deleteEvent,
  assignAdvisorToTour,
  assignGuideToEvent,
  getEventAssignees,
  getAssigneddEventsOfUser,
  getApplicationsOfAdvisor,
  removeAssignedGuideFromEvent,
  getSchoolTourCountsByMonth,
  markEventAsCompleted,
  takeBackEventAction,
  isReviewSubmitted,
  resubmitEventReserveDates,
  updateUserAvailability,
  checkSchoolApplicationExists,
  applyToEvent,
  unapplyFromEvent,
  resendApplicationEmail
} = require("../controllers/EventController");
const adminAuth = require("../middleware/adminMiddleware");

// Route for resubmission of an application
router.post("/resubmit-form/:eventId", resubmitEventReserveDates);
router.post("/resend-application-email/:schoolID", resendApplicationEmail);

// Routes for creating events
router.post("/schooltours", createSchoolTour);
router.post("/individualtours",  createIndividualTour);

// Routes for fetching events
router.get("/", advisorAuth, getAllEvents);
router.get("/accepted", auth, getAcceptedEvents);
router.get("/user", auth, getAssigneddEventsOfUser);
router.get("/advisor", auth, getApplicationsOfAdvisor);
router.get("/completed",auth, getCompletedNonVerifiedEvents);
router.get("/:id", auth, getEvent);

// Add this route to fetch event details by ID
router.get("/details/:id", auth, getEvent);
router.get("/:id/assignees", auth, getEventAssignees);
router.get("/check-review/:eventId", isReviewSubmitted);

// Routes for updating and deleting events
router.put("/:eventId", advisorAuth, updateEvent);
router.put("/edit/:eventId",advisorAuth,updateEventTwo);
router.put("/user/availability", auth, updateUserAvailability);
router.delete("/:eventId", advisorAuth, deleteEvent);

//router.post("/:eventId/cancel", auth,  markEventAsCancelled);
router.post("/:eventId/complete", auth, markEventAsCompleted);
router.post("/:eventId/take-back", auth, takeBackEventAction);

// Routes for assigning roles
router.post("/assign-advisor", auth, assignAdvisorToTour);
router.post("/assign-guide", auth, assignGuideToEvent);

router.post("/remove-guide", auth, removeAssignedGuideFromEvent);

// Route for fetching application counts on the date&time
router.get("/shcooltours/dates",getSchoolTourCountsByMonth);

router.get("/check-school/:schoolID", checkSchoolApplicationExists);

router.post("/apply", auth, applyToEvent);

router.post("/unapply", auth, unapplyFromEvent);

module.exports = router;
