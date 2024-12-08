import React from "react";
import { Link } from "react-router-dom";
import "../styles/EventRow.css"; // Import the CSS file

const EventRow = ({
  event,
  user,
  addToAssignedEvents,
  removeAssignedEvent,
}) => {
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

  return (

    <tr key={event._id} className="event-row">
      <td>{event.applicant?.name || "N/A"}</td>
      <td>{getEventType()}</td>
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
      <td>
        <Link to={`/events/${event._id}`} className="view-details">
          View Details
        </Link>
        {user && user.role === "advisor" && !eventIsFull && event.assignedAdvisor === user._id &&(
        <button
          className="assign-guide-button"
          onClick={() => assignGuide(event._id)}
        >
          Assign Guide
        </button>
      )}
        {user && !checkIfUserHasApplied() && !eventIsFull ? (
          <button
            className="join-button"
            onClick={() => addToAssignedEvents(event._id)}
          >
            Apply To Event
          </button>
        ): 
        (user && checkIfUserHasApplied() && !eventIsFull && (
          <div style={{color: "gray"} }>Applied</div>))}
        {user && user.assignedEvents?.includes(event._id) && (
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
