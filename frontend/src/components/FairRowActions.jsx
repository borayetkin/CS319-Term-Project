import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FaCheck, FaMinus } from "react-icons/fa";

const FairRowActions = ({ fair, user, setMessage, setFairs, handleCompleteFair = ()=>{}, handleCancelFair = () =>{}  }) => {
  const [actionInProcess, setActionInProcess] = useState(false);
  const [workHours, setWorkHours] = useState(0);
  const [showWorkHoursPopup, setShowWorkHoursPopup] = useState(false);
  const personIconUrl =
    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const fairIsFull = fair.currentGuides >= fair.requiredNumberOfGuides;

  const applyToFair = async (fairId) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3000/api/fairs/apply`, {
        method: "POST",
        headers: {
          userrole: user.role,
          userid: user._id,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fairID: fairId }),
      });

      if (response.ok) {
        setMessage("Applied to Fair successfully.");
        setFairs((prevFairs) =>
          prevFairs.map((f) =>
            f._id === fairId ? { ...f, appliedUsers: [...f.appliedUsers, user] } : f
          )
        );
      } else {
        const errorData = await response.json();
        setMessage(`Failed to apply: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
    setActionInProcess(false);
  };

  const unapplyFromFair = async (fairId) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3000/api/fairs/unapply`, {
        method: "POST",
        headers: {
          userrole: user.role,
          userid: user._id,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fairID: fairId }),
      });

      if (response.ok) {
        setMessage("Unapplied from Fair successfully.");
        setFairs((prevFairs) =>
          prevFairs.map((f) =>
            f._id === fairId
              ? { ...f, appliedUsers: f.appliedUsers.filter((u) => u._id !== user._id) }
              : f
          )
        );
      } else {
        const errorData = await response.json();
        setMessage(`Failed to unapply: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
    setActionInProcess(false);
  };

  const rolesThatApply = ["guide", "advisor"];

  const removeAssignedFair = async (fairId) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/fairs/${fairId}/remove-guide`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userID: user._id }),
        }
      );

      if (response.ok) {
        setMessage("Removed from Fair successfully.");
        setFairs((prevFairs) =>
          prevFairs.map((f) =>
            f._id === fairId
              ? { ...f, assignedUsers: f.assignedUsers.filter((u) => u._id !== user._id) }
              : f
          )
        );
      } else {
        const errorData = await response.json();
        setMessage(
          `Failed to remove from fair: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      setMessage(`An error occurred: ${error.message}`);
    }
    setActionInProcess(false);
  };
  const checkIfUserHasAssigned = () => {
    return fair.assignedUsers?.some((assignedUser) => assignedUser._id === user?._id);
  }
  const checkIfUserHasApplied = () => {
    return fair.appliedUsers?.some((appliedUser) => appliedUser._id === user?._id);
  };
  const checkIfFairIsFull = () => {
    console.log(fair.assignedUsers.length, fair.requiredNumberOfGuides);
    return fair.assignedUsers.length >= fair.requiredNumberOfGuides;
  }

  const handleWorkHours = (e) => {
    const value = e.target.value;
    if (value < 0 || value > 10 || value * 1000 % 100 !== 0) {
      return;
    }
    setWorkHours(e.target.value);
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

  const renderForPastAssignedFair = () => {

    const isCompleted = fair.status.includes("completed") || fair.status.includes("canceled");
      return ( !isCompleted &&
        <div style={containerStyle}>
          <button
            className={"action-button apply"}
            disabled={actionInProcess}
            style={buttonStyle}
            onClick={() => setShowWorkHoursPopup(true)}
          >
            Enter Work Hours
          </button>
          {workHours > 0 && `Entered ${workHours}`}
          <div style={innerContainerStyle}>
            <button
              className={"action-button apply"}
              disabled={actionInProcess}
              style={buttonStyle}
              onClick={() => handleCompleteFair(fair._id, workHours)}
            >
              <FaCheck />
              Complete
            </button>
            <button
              className={"action-button unassign"}
              disabled={actionInProcess}
              style={buttonStyle}
              onClick={() => handleCancelFair(fair._id)}
            >
              <FaMinus />
              Cancel
            </button>
          </div>
        </div>
      );
    
  };
  const isPast = new Date(fair.fairDate) < new Date();


  return (
    <div className="action-buttons">
 
      { (isPast) ? renderForPastAssignedFair()  : <>
        {user && !checkIfFairIsFull() && 
        rolesThatApply.includes(user.role) &&
        !checkIfUserHasApplied() && !checkIfUserHasAssigned() &&
           (
          <button
            className="action-button apply"
            onClick={() => applyToFair(fair._id)}
            disabled={actionInProcess}
            style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
          >
            <i className="fas fa-hand-point-up"></i>
            Apply
          </button>
        )}
        {user &&
          rolesThatApply.includes(user.role) &&
          checkIfUserHasApplied() && !checkIfUserHasAssigned()&& (
            <button
              className="action-button unapply"
              onClick={() => unapplyFromFair(fair._id)}
              disabled={actionInProcess}
              style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
            >
              <i className="fas fa-times"></i>
              Unapply
            </button>
          )}
        {user &&
          rolesThatApply.includes(user.role) &&
          checkIfUserHasAssigned() && (
            <button
              className="action-button unassign"
              onClick={() => removeAssignedFair(fair._id)}
              disabled={actionInProcess}
              style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
            >
              <i className="fas fa-user-minus"></i>
              Unassign
            </button>
          )}
        </>
}
      
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
    </div>
  );
};

export default FairRowActions;
