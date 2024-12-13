import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
const FairRowActions = ({ fair, user, setMessage }) => {
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
        window.location.reload();
      } else {
        const errorData = await response.json();
        setMessage(`Failed to apply: ${errorData.message}`);
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
        window.location.reload();
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

  const checkIfUserHasApplied = () => {
    return fair.appliedUsers?.some((appliedUser) => appliedUser === user?._id);
  };

  return (
    <div className="action-buttons">
      <Link to={`/fairs/${fair._id}`} className="action-button view">
        <i className="fas fa-eye"></i>
        View Details
      </Link>
      {user &&
        user.role === "advisor" &&
        !fairIsFull &&
        fair.assignedAdvisor === user._id && (
          <button
            className="action-button assign"
            onClick={() => assignGuide(fair._id)}
            disabled={actionInProcess}
            style= {{cursor : actionInProcess ?  "not-allowed" : ""}}
          >
            <i className="fas fa-user-plus"></i>
            Assign Guide
          </button>
        )}
      {user &&
      rolesThatApply.includes(user.role) &&
      !checkIfUserHasApplied() &&
      !fairIsFull ? (
        <button
          className="action-button apply"
          onClick={() => applyToFair(fair._id)}
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
        !fairIsFull && (
          <span className="status-badge applied">
            <i className="fas fa-check"></i>
            Applied
          </span>
        )
      )}
      {user &&
        rolesThatApply.includes(user.role) &&
        user.assignedFairs?.includes(fair._id) && (
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
