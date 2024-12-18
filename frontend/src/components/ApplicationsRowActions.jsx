import React, { useState } from "react";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";

const ApplicationsRowActions = ({ event, user, setMessage, onActionComplete }) => {
  const [actionInProcess, setActionInProcess] = useState(false);

  const handleAction = async (eventId, event, status) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            userrole: user.role,
            userid: user._id,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, event }),
        }
      );

      if (response.ok) {
        setMessage(
          `Application ${status} successfully. An email notification has been sent to the applicant.`
        );
        onActionComplete && onActionComplete();
      } else {
        const errData = await response.json();
        setMessage(`Failed to ${status} application: ${errData.message}`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
    setActionInProcess(false);
  };

  const handleDelete = async (eventId) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setMessage("Application deleted successfully.");
        onActionComplete && onActionComplete();
      } else {
        setMessage("Failed to delete application.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
    setActionInProcess(false);
  };

  return (
    <div className="button-container">
      {(event.status === "scheduled" || (event.__t === "IndividualTour" && event.status === "pending")) && (
        <>
          <button
            className="accept"
            onClick={() => handleAction(event._id, event, "accepted")}
            disabled={actionInProcess}
            style={{ cursor: actionInProcess ? "not-allowed" : "" }}
            title="Accept"
          >
            <FaCheck />
          </button>
        </>
      )}
          
      {(event.status === "pending" || event.status === "scheduled") && (
        <>
          <button
            className="decline"
            onClick={() => handleAction(event._id, event, "rejected")}
            disabled={actionInProcess}
            style={{ cursor: actionInProcess ? "not-allowed" : "" }}
            title="Decline"
          >
            <FaTimes />
          </button>
        </>
      )}
      <button
        className="delete"
        onClick={() => handleDelete(event._id)}
        disabled={actionInProcess}
        style={{ cursor: actionInProcess ? "not-allowed" : "" }}
        title="Delete"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default ApplicationsRowActions;
