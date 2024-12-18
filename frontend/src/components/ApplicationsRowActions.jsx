import React, { useState } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon 
} from "@mui/icons-material";
import DetailsModal from "./DetailsModal";

// Styled components for custom buttons
const ActionButton = styled(Button)(({ theme, color }) => ({
  margin: '0 4px',
  minWidth: 'unset',
  padding: '4px 8px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  '&.MuiButton-contained': {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  }
}));

const ActionIconButton = styled(IconButton)(({ theme, color }) => ({
  padding: '8px',
  borderRadius: '8px',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: color === 'error' 
      ? 'rgba(239, 68, 68, 0.08)'
      : color === 'success'
      ? 'rgba(34, 197, 94, 0.08)'
      : 'rgba(59, 130, 246, 0.08)',
  },
}));

const ApplicationsRowActions = ({ event, user, setMessage }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
        window.location.reload();
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
        window.location.reload();
      } else {
        setMessage("Failed to delete application.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
    setActionInProcess(false);
  };

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <Tooltip title="View Details">
        <ActionIconButton
          color="primary"
          onClick={() => setShowDetailsModal(true)}
          disabled={actionInProcess}
        >
          <VisibilityIcon fontSize="small" />
        </ActionIconButton>
      </Tooltip>

      {(event.status === "scheduled") && (
        <Tooltip title="Accept">
          <ActionIconButton
            color="success"
            onClick={() => handleAction(event._id, event, "accepted")}
            disabled={actionInProcess}
          >
            <CheckIcon fontSize="small" />
          </ActionIconButton>
        </Tooltip>
      )}
          
      {(event.status === "pending" || event.status === "scheduled") && (
        <Tooltip title="Decline">
          <ActionIconButton
            color="error"
            onClick={() => handleAction(event._id, event, "rejected")}
            disabled={actionInProcess}
          >
            <CloseIcon fontSize="small" />
          </ActionIconButton>
        </Tooltip>
      )}

      <Tooltip title="Delete">
        <ActionIconButton
          color="error"
          onClick={() => handleDelete(event._id)}
          disabled={actionInProcess}
        >
          <DeleteIcon fontSize="small" />
        </ActionIconButton>
      </Tooltip>

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
