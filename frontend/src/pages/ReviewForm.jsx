import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ReviewForm.css";

const ReviewForm = () => {
  const { eventId } = useParams(); // Extract eventId from URL
  const navigate = useNavigate(); // For navigation
  const [rating, setRating] = useState(0); // Start with a default value of 0
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false); // To track if review is already submitted
  const [isCheckingStatus, setIsCheckingStatus] = useState(true); // To track if review status is being checked

  useEffect(() => {
    const checkReviewStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/events/check-review/${eventId}`);
        const data = await response.json();

        if (data.isReviewAlreadySubmitted) {
          setReviewSubmitted(true);
          navigate("/review/submitted");
        }
      } catch (error) {
        console.error("Error checking review status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkReviewStatus();
  }, [eventId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError("Rating is required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3000/api/reviews/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment,
          eventId,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        navigate("/review/submitted");
      } else {
        setError(data.message || "Error submitting review.");
      }
    } catch (error) {
      setError("Error submitting review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (ratingValue) => {
    setRating(ratingValue);
  };

  // If the review has been submitted or we're checking status, don't render the form
  if (reviewSubmitted || isCheckingStatus) {
    return null;
  }

  return (
    <section className="review-form-section">
      <div className="review-form-container">
        <h1>Submit a Review</h1>
        <p className="review-form-description">
          Share your feedback about your experience.
        </p>
        {error && <p className="review-form-error">{error}</p>}
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? "filled" : ""}`}
                  onClick={() => handleRatingClick(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              name="comment"
              rows="5"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="review-form-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ReviewForm;
