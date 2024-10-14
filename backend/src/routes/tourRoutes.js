const express = require("express");
const { createTour, getAllTours } = require("../controllers/tourController");
const router = express.Router();

// Public route for high schools to submit tour applications
router.post("/", createTour);

// Protected route for logged-in users to fetch tours
router.get("/", getAllTours); // Add auth middleware if necessary

module.exports = router;
