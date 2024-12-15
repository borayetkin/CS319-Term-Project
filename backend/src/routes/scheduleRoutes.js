const express = require("express");
const router = express.Router();
const AppointmentManager = require("../applicationManagement/AppointmentManager");
const advisorAuth = require("../middleware/advisorMiddleware");
const adminAuth = require("../middleware/adminMiddleware");
const { getWeeklySchedules, 
        loadWeeklySchedules,
        removeEventFromSchedule, 
        findEventsMatchingSlot, 
        assignEventToSlot
      } = require("../applicationManagement/AppointmentManager");

// Routes for schedule fetching
router.get("/load", adminAuth, loadWeeklySchedules);
router.get("/rebuild", adminAuth, getWeeklySchedules);

// Routes for schedule editing
router.delete("/remove-from-schedule", adminAuth, async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required." });
    }
    await removeEventFromSchedule(eventId);
    res.status(200).json({ message: "Event removed from schedule successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove event from schedule.", error: error.message });
  }
});

router.get("/matching-slot", adminAuth, async (req, res) => {
  try {
    const { weekBeginning, slotDay, slotTime } = req.query;
    if (!weekBeginning || !slotDay || !slotTime) {
      return res.status(400).json({ message: "Week beginning, slot day, and slot time are required." });
    }
    const schoolNames = await findEventsMatchingSlot(new Date(weekBeginning), slotDay, slotTime);
    res.status(200).json({ schoolNames });
  } catch (error) {
    res.status(500).json({ message: "Failed to find matching events.", error: error.message });
  }
});

router.post("/assign-to-slot", adminAuth, async (req, res) => {
  try {
    const { schoolName, weekBeginning, slotDay, slotTime } = req.body;
    if (!schoolName || !weekBeginning || !slotDay || !slotTime) {
      return res.status(400).json({ message: "All fields are required: schoolName, weekBeginning, slotDay, slotTime." });
    }
    await assignEventToSlot(schoolName, new Date(weekBeginning), slotDay, slotTime);
    res.status(200).json({ message: "Event assigned to slot successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign event to slot.", error: error.message });
  }
});

module.exports = router;