const express = require("express");
const {
  getAllTours,
  createTour,
  getTourById,
} = require("../controllers/tourController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Routes definition
router.get("/", auth, getAllTours); // Fetch all tours
router.post("/", createTour); // Create a new tour (not protected)
router.get("/:id", auth, getTourById); // Get a specific tour by ID

module.exports = router;
