
import React, { useState } from "react";
import { FaEye, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import DetailsModal from "./DetailsModal";
const ApplicationsRowActions = ({ event, user, setMessage }) => {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
   
  const handleAction = async (eventId, event, status) => {
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
        window.location.reload();
      } else {
        const errData = await response.json();
        setMessage(`Failed to ${status} application: ${errData.message}`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const handleDelete = async (eventId) => {
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
        window.location.reload();

      } else {
        setMessage("Failed to delete application.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="button-container">
      <button
        onClick={() => setShowDetailsModal(true)}
        className="view-details"
        title="View Details"
      >
        <FaEye />
      </button>
      {event.status === "pending" && (
        <>
          <button
            className="accept"
            onClick={() => handleAction(event._id, event, "accepted")}
            title="Accept"
          >
            <FaCheck />
          </button>
          <button
            className="decline"
            onClick={() => handleAction(event._id, event, "rejected")}
            title="Decline"
          >
            <FaTimes />
          </button>
        </>
      )}
      <button
        className="delete"
        onClick={() => handleDelete(event._id)}
        title="Delete"
      >
        <FaTrash />
      </button>
      {showDetailsModal && (
            <DetailsModal
              application={event}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
    </div>
  );
};

export default ApplicationsRowActions;