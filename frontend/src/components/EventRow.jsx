import React from "react";
import { Link } from "react-router-dom";
import "../styles/EventRow.css"; // Import the CSS file

const EventRow = ({
  event,
  user,
  addToAssignedEvents,
  removeAssignedEvent,
  assignGuide,
}) => {
  const personIconUrl =
  "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const eventIsFull = event.assignedUsers.length >= event.requiredNumberOfGuides
  
  return (
    <tr key={event._id} className="event-row">
      <td>{event.applicant.name}</td>
      <td>{event.__t.replace(/([a-z])([A-Z])/g, "$1 $2")}</td>
      <td>{new Date(event.visitDate).toLocaleDateString()}</td>
      <td>
                <div style={{ display: "flex", gap: "5px" }}>
                  {event.assignedUsers.map((assignee) => (
                    <div
                      key={assignee.id}
                      style={{
                        position: "relative",
                        display: "inline-block",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={personIconUrl}
                        alt={assignee.name}
                        title={assignee.name}
                        style={{ width: "20px", height: "20px" }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          marginBottom: "5px",
                          padding: "5px",
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "#fff",
                          borderRadius: "5px",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          opacity: "0",
                          transition: "opacity 0.2s",
                          pointerEvents: "none",
                        }}
                        className="tooltip"
                      >
                        {assignee.name}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
      <td>{event.requiredNumberOfGuides}</td>
      <td>{event.status}</td>
      <td>
        <Link to={`/events/${event._id}`} className="view-details">
          View Details
        </Link>
        <button
          className="assign-guide-button"
          onClick={() => assignGuide(event._id)}
        >
          Assign Guide
        </button>
        {user && !user.assignedEvents.includes(event._id) && !eventIsFull&& (
          <button
            className="join-button"
            onClick={() => addToAssignedEvents(event._id)}
          >
            Join Event
          </button>
        )}
        {user && user.assignedEvents.includes(event._id) && (
          <button
            className="unassign-button"
            onClick={() => removeAssignedEvent(event._id)}
          >
            Unassign from Event
          </button>
        )}
      </td>
    </tr>
  );
};

export default EventRow;
