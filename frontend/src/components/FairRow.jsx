import React from "react";
import { Link } from "react-router-dom";
import "../styles/FairRow.css"; // Import the CSS file

const FairRow = ({ fair, user, FairRowActions, setMessage, showExtraProperties = [] }) => {
  if (!fair) return null;

  const personIconUrl =
    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const fairIsFull = fair.currentGuides >= fair.requiredNumberOfGuides;

  const assignGuide = (fairID) => {
    window.location.href = `/fairs/${fairID}?assignGuide=true`;
  };

  const checkIfUserHasApplied = () => {
    return fair.appliedUsers?.some(
      (appliedUser) => appliedUser === user?._id
    );
  };

  const getFairType = () => "Fair"; // Placeholder, update if different types exist

  const renderExtraProperty = (property) => {
    if (property === "assignedUsers") {
      return (
        <td>
          {fair.assignedUsers?.length || 0}
          {fair.assignedUsers?.map((user) => (
            <div key={user._id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
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
      );
    } else{
      return (
        <td key={property}>
          {fair[property] || "N/A"}
        </td>
      );
    }
  };

  const existingProperties = ["schoolName", "fairDate", "status"];
  const renderExtraProperties = () => {
    if (showExtraProperties.length === 0) return null;
    return showExtraProperties.map((property) => {
      if (existingProperties.includes(property)) return null;
      return renderExtraProperty(property);
    });
  };

  return (
    <tr key={fair._id} className="fair-row">
      <td>{fair.schoolName || "N/A"}</td>
      <td>{getFairType()}</td>
      <td>{fair.fairDate ? new Date(fair.fairDate).toLocaleDateString() : "N/A"}</td>
      {renderExtraProperties()}
      <td>{fair.status || "N/A"}</td>
      <td className="actions-cell">
        <FairRowActions
          fair={fair}
          user={user}
          setMessage={setMessage}
        />
      </td>
    </tr>
  );
};

export default FairRow;