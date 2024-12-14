const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false,
    maxlength: 500, // Optional comment field with a limit
  },
  date: {
    type: Date,
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Applicant", // Reference to the applicant (reviewer)
    required: true
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
