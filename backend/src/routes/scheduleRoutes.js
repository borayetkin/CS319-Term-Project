const express = require("express");
const router = express.Router();
const advisorAuth = require("../middleware/advisorMiddleware");
const adminAuth = require("../middleware/adminMiddleware");
const { getWeeklySchedules, 
        loadWeeklySchedules,
        removeEvent, 
        getMatchingEventsForSlot, 
        getAllEventsAndMatchingSlots,
        assignEventToSlot,
        clearSchedules,
      } = require("../applicationManagement/AppointmentManager");

// Routes for schedule fetching
router.get("/load", advisorAuth, loadWeeklySchedules);
router.get("/rebuild", advisorAuth, getWeeklySchedules);

// Routes for schedule editing
// Remove Event from Schedule
router.post("/remove-from-schedule", advisorAuth, removeEvent);
router.post("/clear", advisorAuth, clearSchedules);

// Assign Event to Slot
router.post("/assign-to-slot", advisorAuth, assignEventToSlot);

module.exports = router;