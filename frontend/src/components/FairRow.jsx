import React from "react";
import { Link } from "react-router-dom";
import "../styles/EventRow.css"; // Import the CSS file

const FairRow = ({ fair, user, applyToFair }) => {
  const handleApply = () => {
    applyToFair(fair._id);
  };

  return (
    <tr>
      <td>{fair.fairName || "Unnamed Fair"}</td>
      <td>{fair.type}</td>
      <td>{new Date(fair.date).toLocaleDateString()}</td>
      <td>{fair.currentGuides || 0}</td>
      <td>{fair.requiredGuides}</td>
      <td>{fair.status}</td>
      <td>
        <button onClick={handleApply}>Apply</button>
      </td>
    </tr>
  );
};

export default FairRow;
