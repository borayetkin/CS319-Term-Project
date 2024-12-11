import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReviewSubmitted.css';

const ReviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="review-page">
      <div className="review-submitted-container">
        <div className="review-submitted-content">
          <img
            src="../../public/images/tick.png"
            alt="Review Submitted"
            className="submitted-image"
          />
          <h2 className="review-title">Thank you for your review!</h2>
          <p className="review-message">
            Your feedback helps us improve our service. We appreciate your time and effort.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
