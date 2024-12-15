const express = require("express");
const router = express.Router();
const AppointmentManager = require("../applicationManagement/AppointmentManager");
const advisorAuth = require("../middleware/advisorMiddleware");
const adminAuth = require("../middleware/adminMiddleware");
const { getWeeklySchedules, 
        loadWeeklySchedules,
        removeEventFromSchedule, 
        getMatchingEventsForSlot, 
        assignEventToSlot
      } = require("../applicationManagement/AppointmentManager");

// Routes for schedule fetching
router.get("/load", adminAuth, loadWeeklySchedules);
router.get("/rebuild", adminAuth, getWeeklySchedules);

// Routes for schedule editing
// Remove Event from Schedule
router.post("/remove-from-schedule", adminAuth, removeEventFromSchedule);

// Find Events Matching Slot
router.put("/matching-slot", adminAuth, getMatchingEventsForSlot);

// Assign Event to Slot
router.post("/assign-to-slot", adminAuth, assignEventToSlot);

module.exports = router;