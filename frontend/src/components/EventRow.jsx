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
  return (
    <tr key={event._id} className="event-row">
      <td>{event.applicant.name}</td>
      <td>{event.__t.replace(/([a-z])([A-Z])/g, "$1 $2")}</td>
      <td>{new Date(event.visitDate).toLocaleDateString()}</td>
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
        {user && !user.assignedEvents.includes(event._id) && (
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
