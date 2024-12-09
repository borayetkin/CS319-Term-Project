const Review = require("../models/Review");
const Event = require("../models/Event");
const Applicant = require("../models/Applicant");
//const nodemailer = require('nodemailer');

// Create a new review
exports.createReview = async (req, res) => {
  const { rating, comment, eventId, applicantId } = req.body;

  try {
    // Check if the event already has a review
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (event.reviewSubmitted) {
      return res.status(400).json({ message: "Review already submitted for this event." });
    }

    // Create and save the review
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

    res.status(201).json({ message: "Review submitted successfully.", review: savedReview });
  } catch (error) {
    res.status(500).json({ message: "Error creating review.", error: error.message });
  }
};

// Fetch a specific review
exports.getReview = async (req, res) => {
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

// Fetch all reviews for a specific user
exports.getReviewsByApplicant = async (req, res) => {
  const { applicantId } = req.params;

  try {
    const reviews = await Review.find({ applicant: applicantId })
      .populate("event", "visitDate visitTime");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews.", error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Update the event to remove the review reference
    await Event.findByIdAndUpdate(review.event, {
      review: null,
      reviewSubmitted: false,
    });

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review.", error: error.message });
  }
};

exports.sendReviewEmail = async (req, res) => {
  const { eventId } = req.body;

  try {
    const event = await Event.findById(eventId).populate('applicant');
    if (!event) return res.status(404).send("Event not found");

    const applicant = event.applicant;
    if (!applicant || !applicant.email) return res.status(404).send("Applicant email not found");

    // ORIGINAL EMAIL SENDING ALGO, WILL BE IMPLEMENTED IN THE FUTURE
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    }); 

    // Email content
    const reviewLink = `http://domain.com/review/${eventId}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: applicant.email,
      subject: 'Submit Your Review',
      text: `Please submit your review for the event. Click the link: ${reviewLink}`,
      html: `<p>Please submit your review for the event. Click the link: <a href="${reviewLink}">Submit Review</a></p>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).send("Review link sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send review link");
  } */

  const reviewLink = `http://localhost:${process.env.PORT}/review/${eventId}`;
    console.log(`Email to: ${applicant.email}`);
    console.log(`Subject: Submit Your Review`);
    console.log(`Content: Please submit your review here: ${reviewLink}`);

    res.status(200).send("Simulated email sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send review link");
  }
};