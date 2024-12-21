import zIndex from "@mui/material/styles/zIndex";
import React, { useState } from "react";

import { FaCheck, FaUserMinus, FaMinus } from "react-icons/fa";

const AssignedEventsActions = ({
  event,
  user,
  setMessage,
  handleCompleteEvent,
  handleCancelEvent,
  handleTakeBackAction,
  actionInProcess,
  setActionInProcess
}) => {
  const isPast = new Date(event.visitDate) < new Date();
  const isCompleted = event.status.includes("completed") || event.status.includes("canceled");
  const [workHours, setWorkHours] = useState(0);
  const [showWorkHoursPopup, setShowWorkHoursPopup] = useState(false);

  const handleWorkHours = (e) => {
    const value = e.target.value;
    if (value < 0) {
      return;
    }
    if (value > 10) {
      return;
    }
    if (value * 1000 % 100 !== 0) {
      return;
    }

    setWorkHours(e.target.value);
  };

  const removeAssignedEvent = async (eventId) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/events/remove-guide`, {
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

  const handlePopupClick = (e) => {
    if (e.target.className === "popup-overlay") {
      setShowWorkHoursPopup(false);
    }
  };

  const popupOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const popupContentStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "5px",
  };

  const buttonStyle = {
    cursor: actionInProcess ? "not-allowed" : "pointer",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    minHeight: "150px!important",
  };

  const innerContainerStyle = {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
    maxHeight: "50px",
  };

  return (
    <>
      {!isCompleted && isPast && (
        <div style={containerStyle}>
          <button
            className={"action-button apply"}
            disabled={actionInProcess}
            style={buttonStyle}
            onClick={() => setShowWorkHoursPopup(true)}
          >
            Enter Work Hours
          </button> 
          { workHours>0 && `Entered ${workHours}` }
          <div style={innerContainerStyle}>
            <button
              className={"action-button apply"}
              disabled={actionInProcess}
              style={buttonStyle}
              onClick={() => handleCompleteEvent(event)}
            >
              <FaCheck />
              Complete
            </button>
            <button
              className={"action-button unassign"}
              disabled={actionInProcess}
              style={buttonStyle}
              onClick={() => handleCancelEvent(event._id)}
            >
              <FaMinus />
              Cancel
            </button>
          </div>
        </div>
      )}
      {!isPast && !isCompleted && (
        <button
          className={"action-button unassign"}
          disabled={actionInProcess}
          style={buttonStyle}
          onClick={() => removeAssignedEvent(event._id)}
        >
          <FaUserMinus />
          Unassign
        </button>
      )}
      {isCompleted && (
        <button
          className={"action-button unassign"}
          onClick={() => handleTakeBackAction(event._id)}
          disabled={actionInProcess}
          style={buttonStyle}
        >
          <FaMinus />
          Take Back
        </button>
      )}
      {showWorkHoursPopup && (
        <div className="popup-overlay" onClick={handlePopupClick} style={popupOverlayStyle}>
          <div className="popup-content" style={popupContentStyle}>
            <label htmlFor="workHours">Enter Work Hours: </label>
            <input
              name="workHours"
              type="number"
              placeholder=""
              value={workHours}
              onChange={handleWorkHours}
              style={{ maxWidth: "80px", cursor: actionInProcess ? "not-allowed" : "pointer" }}
              disabled={actionInProcess}
            />
            <button onClick={() => setShowWorkHoursPopup(false)} style={{ marginLeft: "10px" }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignedEventsActions;
