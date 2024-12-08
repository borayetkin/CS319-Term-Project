import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/CoordinatorPages/GuideManagement.css";

const GuideManagement = () => {
  const [fairs, setFairs] = useState([]);
  const [guides, setGuides] = useState([]);
  const [updatedAssignments, setUpdatedAssignments] = useState({});
  const [updatedRemovals, setUpdatedRemovals] = useState({});
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const personIconUrl = "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

  const navigate = useNavigate();

  useEffect(() => {
    fetchFairs();
    fetchGuides();
  }, []);

  const fetchFairs = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/fairs/accepted-fairs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const fairsData = await response.json();
        setFairs(fairsData);
      } else {
        setMessage("Failed to fetch fairs.");
      }
    } catch (error) {
      setMessage("Error fetching fairs: " + error.message);
    }
  };

  const fetchGuides = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/guides", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGuides(data);
      } else {
        setMessage("Failed to fetch guides.");
      }
    } catch (error) {
      setMessage("Error fetching guides: " + error.message);
    }
  };

  const assignGuide = async (fairId) => {
    const guideToAssign = updatedAssignments[fairId];

    try {
      if (guideToAssign) {
        const assignResponse = await fetch(
          `http://localhost:3000/api/fairs/${fairId}/assign-guide`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userID: guideToAssign }),
          }
        );

        if (!assignResponse.ok) {
          const errorData = await assignResponse.json();
          throw new Error(errorData.message || "Failed to assign guide");
        }
        setMessage("Guide assigned successfully!");
        fetchFairs(); // Refresh the fairs list
      }
    } catch (error) {
      setMessage("Error assigning guide: " + error.message);
    }
  };

  const removeGuide = async (fairId) => {
    const guideToRemove = updatedRemovals[fairId];

    try {
      if (guideToRemove) {
        const removeResponse = await fetch(
          `http://localhost:3000/api/fairs/${fairId}/remove-guide`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userID: guideToRemove }),
          }
        );

        if (!removeResponse.ok) {
          const errorData = await removeResponse.json();
          throw new Error(errorData.message || "Failed to remove guide");
        }
        setMessage("Guide removed successfully!");
        fetchFairs(); // Refresh the fairs list
      }
    } catch (error) {
      setMessage("Error removing guide: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h1>Fair Guide Management</h1>
        <button
          onClick={() => navigate("/dashboard/ManageFairs")}
          style={{ padding: "10px 20px" }}
        >
          Waiting
        </button>
        <button
          onClick={() => navigate("/completed-fairs")}
          style={{ padding: "10px 20px" }}
        >
          View Completed Fairs
        </button>
      </div>
      {message && <p>{message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>School</th>
            <th>City</th>
            <th>Date</th>
            <th>Time</th>
            <th>Required Guides</th>
            <th>Assigned Guides</th>
            <th>Assign New Guide</th>
            <th>Remove Guide</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fairs.map((fair, index) => (
            <tr key={fair._id}>
              <td>{index + 1}</td>
              <td>{fair.schoolName}</td>
              <td>{fair.city}</td>
              <td>{new Date(fair.fairDate).toLocaleDateString()}</td>
              <td>{fair.fairTime}</td>
              <td>{fair.requiredNumberOfGuides}</td>
              <td>
                {fair.assignedUsers.map((guide) => (
                  <div
                    key={guide._id}
                    style={{ display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <img
                      src={personIconUrl}
                      alt={guide.name || "Guide"}
                      title={guide.name || "Guide"}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    {guide.name || "Guide Not Found"}
                  </div>
                ))}
              </td>
              <td>
                {/* Assign New Guide Dropdown */}
                <select
                  onChange={(e) =>
                    setUpdatedAssignments((prev) => ({
                      ...prev,
                      [fair._id]: e.target.value,
                    }))
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Guide
                  </option>
                  {guides.map((guide) => (
                    <option key={guide._id} value={guide._id}>
                      {guide.name}
                    </option>
                  ))}
                </select>
                {/* Assign Button */}
                <button
                  style={{ marginTop: "10px", padding: "5px 10px" }}
                  onClick={() => assignGuide(fair._id)}
                >
                  Assign Guide
                </button>
              </td>
              <td>
                {/* Remove Guide Dropdown */}
                <select
                  onChange={(e) =>
                    setUpdatedRemovals((prev) => ({
                      ...prev,
                      [fair._id]: e.target.value,
                    }))
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Guide
                  </option>
                  {fair.assignedUsers.map((guide) => (
                    <option key={guide._id} value={guide._id}>
                      {guide.name}
                    </option>
                  ))}
                </select>
                {/* Remove Button */}
                <button
                  style={{ marginTop: "10px", padding: "5px 10px" }}
                  onClick={() => removeGuide(fair._id)}
                >
                  Remove Guide
                </button>
              </td>
              <td>
                {/* Any additional actions, if required */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GuideManagement;
