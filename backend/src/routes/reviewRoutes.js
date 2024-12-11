const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/ReviewController");

// Create a review
router.post("/create", reviewController.createReview);

// Get a specific review by ID
router.get("/:reviewId", reviewController.getReview);

// Get all reviews by applicant ID
router.get("/applicant/:applicantId", reviewController.getReviewsByApplicant);

// Delete a review
router.delete("/:reviewId", reviewController.deleteReview);

module.exports = router;