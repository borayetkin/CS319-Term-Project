import React, { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const ApplicationsRowActions = ({
  event,
  user,
  setMessage,
  onActionComplete,
}) => {
  const [actionInProcess, setActionInProcess] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null); // "reject" or "delete"
  const [eventIdToActOn, setEventIdToActOn] = useState(null);

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

  const confirmAction = async () => {
    setShowConfirmationPopup(false);
    if (confirmationAction === "reject") {
      await handleAction(eventIdToActOn, event, "rejected");
    } else if (confirmationAction === "delete") {
      await handleDelete(eventIdToActOn);
    }
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {/* Accept Button */}
      {(event.status === "scheduled" ||
        (event.__t === "IndividualTour" && event.status === "pending")) && (
        <Tooltip title="Accept" arrow>
          <span>
            <IconButton
              onClick={() => handleAction(event._id, event, "accepted")}
              disabled={actionInProcess}
              size="small"
              sx={{
                color: "success.main",
                "&:hover": {
                  backgroundColor: "success.lighter",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CheckCircleOutlineIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {/* Decline Button */}
      {(event.status === "pending" || event.status === "scheduled") && (
        <Tooltip title="Decline" arrow>
          <span>
            <IconButton
              onClick={() => {
                setConfirmationAction("reject");
                setEventIdToActOn(event._id);
                setShowConfirmationPopup(true);
              }}
              disabled={actionInProcess}
              size="small"
              sx={{
                color: "error.main",
                "&:hover": {
                  backgroundColor: "error.lighter",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CancelOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {/* Delete Button */}
      <Tooltip title="Delete" arrow>
        <span>
          <IconButton
            onClick={() => {
              setConfirmationAction("delete");
              setEventIdToActOn(event._id);
              setShowConfirmationPopup(true);
            }}
            disabled={actionInProcess}
            size="small"
            sx={{
              color: "grey.600",
              "&:hover": {
                backgroundColor: "grey.100",
              },
              transition: "all 0.2s ease",
            }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </span>
      </Tooltip>

      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup">
            <h3>
              Are you sure you want to {confirmationAction} this application?
            </h3>
            <div className="popup-actions">
              <button className="popup-confirm" onClick={confirmAction}>
                Yes
              </button>
              <button
                className="popup-cancel"
                onClick={() => setShowConfirmationPopup(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsRowActions;
