import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
const EventRowActions = ({ event, user, setMessage }) => {
  const [actionInProcess, setActionInProcess] = useState(false);
  const personIconUrl =
    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const eventIsFull =
    event.assignedUsers?.length >= event.requiredNumberOfGuides;

  const applyToEvent = async (eventId) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3000/api/events/apply`, {
        method: "POST",
        headers: {
          userrole: user.role,
          userid: user._id,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventID: eventId, userID: user._id }),
      });
      if (response.ok) {
        setMessage(`Applied To Event successfully.`);
        window.location.reload();
      } else {
        setMessage(`Failed to apply.`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
    setActionInProcess(false);
  };
  const rolesThatApply = ["guide", "advisor"];
  const removeAssignedEvent = async (eventId) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/events/remove-guide`,
        {
          method: "POST",
          headers: {
            userrole: user.role,
            userid: user._id,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventID: eventId, userID: user._id }),
        }
      );
      if (response.ok) {
        setMessage(`Removed from Event successfully.`);
        window.location.reload();
      } else {
        setMessage(`Failed to remove from event.`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
    setActionInProcess(false);
  };
  const checkIfUserHasApplied = () => {
    return event.appliedUsers?.some(
      (appliedUser) => appliedUser._id === user?._id
    );
  };

  return (
    <div className="action-buttons">
      <Link to={`/events/${event._id}`} className="action-button view">
        <i className="fas fa-eye"></i>
        View Details
      </Link>

      {user &&
      rolesThatApply.includes(user.role) &&
      !checkIfUserHasApplied() &&
      !eventIsFull ? (
        <button
          className="action-button apply"
          onClick={() => applyToEvent(event._id)}
          disabled={actionInProcess}
          style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
        >
          <i className="fas fa-hand-point-up"></i>
          Apply
        </button>
      ) : (
        user &&
        rolesThatApply.includes(user.role) &&
        checkIfUserHasApplied() &&
        !eventIsFull && (
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
          disabled={actionInProcess}
          style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
        >
          <i className="fas fa-user-minus"></i>
          Unassign
        </button>
      )}
    </div>
  );
};

export default EventRowActions;
