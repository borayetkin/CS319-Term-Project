import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/EventRow.css"; // Import the CSS file

const EventRow = ({
  event,
  user,
  addToAssignedEvents,
  removeAssignedEvent,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!event) return null;

  const personIconUrl =
  "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const eventIsFull = event.assignedUsers?.length >= event.requiredNumberOfGuides;
  const assignGuide = (eventID) => {
    window.location.href = `/events/${eventID}?assignGuide=true`;
    
  };
  const checkIfUserHasApplied = () => {
    return event.appliedUsers?.some(appliedUser => appliedUser._id === user?._id);
  };

  // Helper function to determine event type
  const getEventType = () => {
    if (event.__t === "SchoolTour") return "School Tour";
    if (event.__t === "IndividualTour") return "Individual Tour";
    return event.typeStr || "N/A"; // Fallback to typeStr if available
  };

  const EventDetailsModal = ({ event, onClose }) => {
    if (!event) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            ×
          </button>

          <div className="details-grid">
            {event.__t === "SchoolTour" ? (
              <>
                <div className="detail-item">
                  <label>School Name:</label>
                  <p>{event.schoolName || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Contact Person:</label>
                  <p>{event.contactPerson || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Student Count:</label>
                  <p>{event.studentCount || "N/A"}</p>
                </div>
              </>
            ) : (
              <>
                <div className="detail-item">
                  <label>Student Name:</label>
                  <p>{event.studentName || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>High School:</label>
                  <p>{event.studentHighSchool || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Major of Interest:</label>
                  <p>{event.majorOfInterest || "N/A"}</p>
                </div>
              </>
            )}

            <div className="detail-item">
              <label>Date:</label>
              <p>{new Date(event.visitDate).toLocaleDateString()}</p>
            </div>

            <div className="detail-item">
              <label>Time:</label>
              <p>{new Date(event.visitDate).toLocaleTimeString()}</p>
            </div>

            <div className="detail-item">
              <label>City:</label>
              <p>{event.city || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Email:</label>
              <p>{event.email || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Phone:</label>
              <p>{event.phoneNumber || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Required Guides:</label>
              <p>{event.requiredNumberOfGuides}</p>
            </div>

            <div className="detail-item">
              <label>Status:</label>
              <span className={`status-badge ${event.status}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>

            <div className="detail-item full-width">
              <label>Assigned Guides:</label>
              <div className="assigned-guides-list">
                {event.assignedUsers?.length > 0 ? (
                  event.assignedUsers.map(guide => (
                    <div key={guide._id} className="guide-item">
                      <img src={personIconUrl} alt={guide.name} />
                      <span>{guide.name}</span>
                    </div>
                  ))
                ) : (
                  <p>No guides assigned yet</p>
                )}
              </div>
            </div>

            <div className="detail-item full-width">
              <label>Additional Notes:</label>
              <p className="notes">{event.additionalNotes || "No additional notes"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <tr key={event._id} className="event-row" >
      <td>{event.applicant?.name || "N/A"}</td>
      <td> <div className="time">{event.visitTime}</div></td>
      <td>
        {event.visitDate ? new Date(event.visitDate).toLocaleDateString() : "N/A"}
      </td>
      <td>
        {event.assignedUsers?.length || 0}
        {event.assignedUsers?.map((user) => (
          <div key={user._id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <img
              src={personIconUrl}
              alt={user.name}
              title={user.name}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            {user.name}
          </div>
        ))}
      </td>
      <td>{event.requiredNumberOfGuides || "N/A"}</td>
      <td>{event.status || "N/A"}</td>
      <td className="actions-cell">
        <div className="action-buttons">
          <button
            className="action-button details"
            onClick={() => setShowDetails(true)}
          >
            <i className="fas fa-eye"></i>
            View Details
          </button>
          
          {user && user.role === "advisor" && !eventIsFull && event.assignedAdvisor === user._id && (
            <button
              className="action-button assign"
              onClick={() => assignGuide(event._id)}
            >
              <i className="fas fa-user-plus"></i>
              Assign Guide
            </button>
          )}
          
          {user && !checkIfUserHasApplied() && !eventIsFull ? (
            <button
              className="action-button apply"
              onClick={() => addToAssignedEvents(event._id)}
            >
              <i className="fas fa-hand-point-up"></i>
              Apply
            </button>
          ) : (
            user && checkIfUserHasApplied() && !eventIsFull && (
              <span className="status-badge applied">
                <i className="fas fa-check"></i>
                Applied
              </span>
            )
          )}
          
          {user && user.assignedEvents?.includes(event._id) && (
            <button
              className="action-button unassign"
              onClick={() => removeAssignedEvent(event._id)}
            >
              <i className="fas fa-user-minus"></i>
              Unassign
            </button>
          )}
        </div>
      </td>
      {showDetails && (
        <EventDetailsModal
          event={event}
          onClose={() => setShowDetails(false)}
        />
      )}
    </tr>
  );
};

export default EventRow;
