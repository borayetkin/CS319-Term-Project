const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/ReviewController");
const advisorAuth = require("../middleware/advisorMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

// Create a review
router.post("/create", reviewController.createReview);

// Get a specific review by ID
router.get("/:reviewId", advisorAuth, reviewController.getReview);

// Get all reviews by applicant ID
router.get("/applicant-reviews/:applicantId", advisorAuth, reviewController.getReviewsByApplicant);

// Get all reviews by user ID
router.get("/user-reviews/:userId", advisorAuth, reviewController.getReviewsByUser);

// Delete a review
router.delete("/:reviewId", adminAuth, reviewController.deleteReview);

module.exports = router;