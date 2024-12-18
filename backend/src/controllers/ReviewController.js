const Review = require("../models/Review");
const Event = require("../models/Event");
const Applicant = require("../models/Applicant");
const User = require("../models/User");

// Create a new review
exports.createReview = async (req, res) => {
  const { rating, comment, eventId } = req.body;

  try {
    // Validate input fields
    if (!rating) {
      return res.status(400).json({ message: "Rating is required." });
    }

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Check if the event already has a review
    if (event.reviewSubmitted) {
      return res.status(400).json({ message: "Review already submitted for this event." });
    }

    // Retrieve assigned users (if needed)
    const assignees = event.assignedUsers
      ? await User.find({ _id: { $in: event.assignedUsers } })
      : [];

    // Create and save the review
    const applicantId = event.applicant;
    const review = new Review({
      rating,
      comment,
      date: new Date(),
      event: eventId,
      applicant: applicantId,
    });
    const savedReview = await review.save();

    // Update the event with the review reference and mark it as submitted
    event.review = savedReview._id;
    event.reviewSubmitted = true;
    await event.save();

    // Update each assigned user's reviews and recalculate their averageRating
    for (const assignee of assignees) {
      assignee.reviews.push(savedReview._id);

      // Fetch all reviews associated with this user
      const userReviews = await Review.find({ _id: { $in: assignee.reviews } });

      // Calculate the average rating
      const totalRating = userReviews.reduce((sum, rev) => sum + rev.rating, 0);
      assignee.averageRating = userReviews.length > 0 ? totalRating / userReviews.length : 0;

      // Save the updated user
      await assignee.save();
    }

    // Return success response
    res.status(201).json({ message: "Review submitted successfully.", review: savedReview });
  } catch (error) {
    console.error("Error creating review:", error.message);
    res.status(500).json({ message: "Error creating review.", error: error.message });
  }
};


// Fetch a specific review
exports.getReviewById = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId)
      .populate("event", "visitDate visitTime")
      .populate("applicant", "name email");

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error fetching review.", error: error.message });
  }
};

exports.getReviewOfEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId).populate("review");

    res.status(200).json(event.review);
  } catch (error) {
    res.status(500).json({ message: "Error fetching review.", error: error.message });
  }
}

exports.getReviewsOfUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ _id: userId }).populate("reviews");

    res.status(200).json(user.reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews.", error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const user = await User.updateOne(
      { 'reviews._id': reviewId }, // Find the user with a matching review ID
      { $pull: { reviews: { _id: reviewId } } } // Pull (remove) the review with the specific reviewId
    );

    if (user.nModified === 0) {
      console.log('No matching review found to delete.');
      return null;
    }

    // Update the event to remove the review reference
    await Event.findByIdAndUpdate(review.event, {
      review: null,
      reviewSubmitted: false,
    });

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review.", error: error.message });
  }
};