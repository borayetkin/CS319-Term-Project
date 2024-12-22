import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiMail, FiPhone, FiStar } from 'react-icons/fi';
import { RiTeamLine } from 'react-icons/ri';
import "../../../styles/CoordinatorPages/ViewGuidesPage.css";
import LoadingSpinner from '../../../components/LoadingSpinner';

const ViewGuidesPage = () => {
  const [guides, setGuides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/guides', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch guides');
      const data = await response.json();
      setGuides(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleShowDetails = (guide) => {
    setSelectedGuide(guide);
    setShowDetailsModal(true);
  };

  const handleShowReviews = (guide) => {
    setReviews(guide.reviews);
    setShowReviewsModal(true);
  };

  const filteredGuides = guides.filter(guide =>
    guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ReviewsModal = ({ reviews, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content reviews-modal">
        <h2>Guide Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              {/* Review Header */}
              <div className="review-header">
                <div className="review-user-info">
                  <span className="user-icon">👤</span>
                  <div className="user-details">
                    <p className="applicant-name">
                      {review.applicant?.name || "Unknown Applicant"}
                    </p>
                  </div>
                </div>
                <div className="review-date">
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
  
              {/* Star Rating */}
              <div className="review-rating">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`star-icon ${i < review.rating ? "filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>
  
              {/* Review Comment */}
              <div className="review-comment">
                <p>{review.comment || "No comment provided"}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-reviews">No reviews available for this guide.</p>
        )}
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
  
  

  const GuideDetailsModal = ({ guide, onClose }) => {
    if (!guide) return null;
    
    const formatEventInfo = (event) => {
      if (!event) return null;
      
      let title = event.schoolName || event.applicant?.name || "Unnamed Event";
      return (
        <div key={event._id} className="event-item">
          <div className="event-header">
            <strong>{title}</strong>
            <span className="event-status">{event.status}</span>
          </div>
          <div className="event-details">
            <p>
              <span>Date:</span> {event.visitDate ? new Date(event.visitDate).toLocaleDateString() : 'N/A'}
            </p>
            <p>
              <span>Time:</span> {event.visitTime || 'N/A'}
            </p>
            <p>
              <span>Location:</span> {event.location || 'N/A'}
            </p>
            <p>
              <span>City:</span> {event.city || 'N/A'}
            </p>
            {event.studentCount && (
              <p>
                <span>Students:</span> {event.studentCount}
              </p>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Guide Details</h2>
          
          <div className="details-grid">
            <div className="detail-item">
              <label>Name:</label>
              <p>{guide.name || "N/A"}</p>
            </div>
            
            <div className="detail-item">
              <label>Email:</label>
              <p>{guide.email || "N/A"}</p>
            </div>
            
            <div className="detail-item">
              <label>Phone:</label>
              <p>{guide.phone || "N/A"}</p>
            </div>
            
            <div className="detail-item">
              <label>Department:</label>
              <p>{guide.major || "N/A"}</p>
            </div>


            <div className="detail-item">
              <label>Year:</label>
              <p>{guide.year || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Total Work Hours:</label>
              <p>{guide.totalWorkHours || "0"}</p>
            </div>

            <div className="detail-item">
              <label>Average Rating:</label>
              <p>⭐{guide.averageRating?.toFixed(1) || "No ratings yet"}</p>
            </div>


            <div className="detail-item full-width">
              <label>Assigned Events:</label>
              <div className="events-list">
                {guide.assignedEvents?.length > 0 ? (
                  guide.assignedEvents.map(event => formatEventInfo(event))
                ) : (
                  <p>No assigned events</p>
                )}
              </div>
            </div>

            <div className="detail-item full-width">
              <label>Completed Events:</label>
              <div className="events-list">
                {guide.completedEvents?.length > 0 ? (
                  guide.completedEvents.map(event => formatEventInfo(event))
                ) : (
                  <p>No completed events</p>
                )}
              </div>
            </div>
          </div>

          <button className="close-button" onClick={onClose}>
            X
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner  loading='guides'/>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="view-guides-page-container">
      <h1>View Guides</h1>
      
      <div className="controls-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search guides by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredGuides.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Year</th>
              <th>Work Hours</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuides.map((guide) => (
              <tr key={guide._id}>
                <td>
                  <div className="guide-name">
                    <RiTeamLine className="guide-icon" />
                    {guide.name}
                  </div>
                </td>
                <td>
                  <div className="guide-email">
                    <FiMail className="email-icon" />
                    {guide.email}
                  </div>
                </td>
                <td>
                  <div className="guide-phone">
                    <FiPhone className="phone-icon" />
                    {guide.phoneNumber || "N/A"}
                  </div>
                </td>
                <td>{guide.major || "N/A"}</td>
                <td>{guide.year || "N/A"}</td>
                <td>{guide.totalWorkHours || 0}</td>
                <td>⭐{guide.averageRating?.toFixed(1) || "N/A"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-button details"
                      onClick={() => handleShowDetails(guide)}
                      title="Show Details"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      className="action-button reviews"
                      onClick={() => handleShowReviews(guide)}
                      title="Show Reviews"
                    >
                      <FiStar size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          <p>No guides found matching your criteria.</p>
        </div>
      )}
      
      {showDetailsModal && (
        <GuideDetailsModal
          guide={selectedGuide}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showReviewsModal && (
        <ReviewsModal
          reviews={reviews}
          onClose={() => setShowReviewsModal(false)}
        />
      )}
    </div>
  );
};

export default ViewGuidesPage; 