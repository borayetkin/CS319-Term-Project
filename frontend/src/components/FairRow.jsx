import React from "react";
import { Link } from "react-router-dom";
import "../styles/FairRow.css"; // Import the CSS file

const FairRow = ({ fair, user, applyToFair, removeAssignedFair }) => {
  if (!fair) return null;

  const personIconUrl =
    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const fairIsFull = fair.currentGuides >= fair.requiredNumberOfGuides;

  const assignGuide = (fairID) => {
    window.location.href = `/fairs/${fairID}?assignGuide=true`;
  };

  const checkIfUserHasApplied = () => {
    return fair.appliedUsers?.some(
      (appliedUser) => appliedUser._id === user?._id
    );
  };

  const getFairType = () => "Fair"; // Placeholder, update if different types exist

  return (
    <tr key={fair._id} className="fair-row">
      <td>{fair.schoolName || "N/A"}</td>
      <td>{getFairType()}</td>
      <td>{fair.fairDate ? new Date(fair.fairDate).toLocaleDateString() : "N/A"}</td>
      <td>
        {fair.assignedUsers?.length || 0}
        {fair.assignedUsers?.map((user) => (
          <div
            key={user._id}
            style={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <img
              src={personIconUrl}
              alt={user.name}
              title={user.name}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            {user.name}
          </div>
        ))}
      </td>
      <td>{fair.requiredNumberOfGuides || "N/A"}</td>
      <td>{fair.status || "N/A"}</td>
      <td className="actions-cell">
        <div className="action-buttons">
          <Link to={`/fairs/${fair._id}`} className="action-button view">
            <i className="fas fa-eye"></i>
            View Details
          </Link>

          {user && user.role === "advisor" && !fairIsFull && fair.assignedAdvisor === user._id && (
            <button
              className="action-button assign"
              onClick={() => assignGuide(fair._id)}
            >
              <i className="fas fa-user-plus"></i>
              Assign Guide
            </button>
          )}

          {user && !checkIfUserHasApplied() && !fairIsFull ? (
            <button
              className="action-button apply"
              onClick={() => applyToFair(fair._id)}
            >
              <i className="fas fa-hand-point-up"></i>
              Apply
            </button>
          ) : (
            user && checkIfUserHasApplied() && !fairIsFull && (
              <span className="status-badge applied">
                <i className="fas fa-check"></i>
                Applied
              </span>
            )
          )}

          {user && user.assignedFairs?.includes(fair._id) && (
            <button
              className="action-button unassign"
              onClick={() => {
                console.log("Unassign clicked for Fair ID:", fair._id); // Debug: Log Fair ID on click
                console.log("Current user info:", user); // Debug: Log user info
                removeAssignedFair(fair._id);
              }}
            >
              <i className="fas fa-user-minus"></i>
              Unassign
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default FairRow;