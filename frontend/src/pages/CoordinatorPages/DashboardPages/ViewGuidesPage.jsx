import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiMail, FiPhone } from 'react-icons/fi';
import { RiTeamLine } from 'react-icons/ri';
import "../../../styles/CoordinatorPages/ViewGuidesPage.css";

const ViewGuidesPage = () => {
  const [guides, setGuides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const filteredGuides = guides.filter(guide =>
    guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const GuideDetailsModal = ({ guide, onClose }) => {
    if (!guide) return null;
    
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
              <p>{guide.department || "N/A"}</p>
            </div>
            
            <div className="detail-item">
              <label>Available Days:</label>
              <p>{guide.availableDays?.join(', ') || "Not set"}</p>
            </div>
            
            <div className="detail-item">
              <label>Preferred Hours:</label>
              <p>{guide.preferredHours || "Not set"}</p>
            </div>
            
            <div className="detail-item">
              <label>Languages:</label>
              <p>{guide.languages?.join(', ') || "Not specified"}</p>
            </div>
            
            <div className="detail-item">
              <label>Tours Completed:</label>
              <p>{guide.toursCompleted || "0"}</p>
            </div>

            <div className="detail-item full-width">
              <label>Assigned Events:</label>
              <div className="assigned-events-list">
                {guide.assignedEvents?.length > 0 ? (
                  guide.assignedEvents.map(event => (
                    <div key={event._id} className="event-item">
                      <p>{new Date(event.date).toLocaleDateString()} - {event.time}</p>
                      <p>{event.title || "Unnamed Event"}</p>
                    </div>
                  ))
                ) : (
                  <p>No assigned events</p>
                )}
              </div>
            </div>
          </div>

          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="view-guides-page-container">
      <h1>View Guides</h1>
      
      <div className="controls-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search guides by name or email..."
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
              <th>Available Days</th>
              <th>Tours Completed</th>
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
                    {guide.phone || "N/A"}
                  </div>
                </td>
                <td>{guide.department || "N/A"}</td>
                <td>{guide.availableDays?.join(', ') || "Not set"}</td>
                <td>{guide.toursCompleted || "0"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-button details"
                      onClick={() => handleShowDetails(guide)}
                      title="Show Details"
                    >
                      <FiEye size={16} />
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
    </div>
  );
};

export default ViewGuidesPage; 