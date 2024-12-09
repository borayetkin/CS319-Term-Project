import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ReviewPage.css"; // Custom CSS for styling

const ReviewPage = () => {
  const { id } = useParams(); // Get event ID from the URL
  const navigate = useNavigate();

  // State variables for the review form
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${id}`);
        setMessage("");  // Reset message on successful data fetch
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Failed to load event details.");
      }
    };

    fetchEvent();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rating, comment } = formData;

    if (rating === 0 || comment.trim() === "") {
      setError("Please provide both a rating and a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/review/create", {
        eventId: id,
        rating,
        comment,
      });

      if (response.status === 200) {
        setMessage("Review submitted successfully!");
        setFormData({
          rating: 0,
          comment: "",
        });
        navigate(`/events/${id}`);
      } else {
        setError("Failed to submit the review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit the review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="review-section">
      <div className="review-container">
        <h1>Submit Your Review</h1>
        {message && <p className="review-message success">{message}</p>}
        {error && <p className="review-message error">{error}</p>}

        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="rating">Rating (1-5):</label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              required
            >
              <option value="0">Select a rating</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review:</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows="4"
              placeholder="Write your comments here"
              required
            />
          </div>

          <button type="submit" className="review-submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ReviewPage;
