import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
const FairRowActions = ({ fair, user, setMessage, setFairs }) => {
  const [actionInProcess, setActionInProcess] = useState(false);
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

  return (
    <div className="action-buttons">
      <Link to={`/fairs/${fair._id}`} className="action-button view">
        <i className="fas fa-eye"></i>
        View Details
      </Link>
      
      {user && !checkIfFairIsFull() && 
      rolesThatApply.includes(user.role) &&
      !checkIfUserHasApplied() && !checkIfUserHasAssigned() &&
      !fairIsFull && (
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
    </div>
  );
};

export default FairRowActions;
