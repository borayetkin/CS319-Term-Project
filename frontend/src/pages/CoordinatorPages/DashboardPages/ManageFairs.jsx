import React, { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiCheck, FiX, FiTrash2, FiEye } from 'react-icons/fi';
import '../../../styles/CoordinatorPages/ManageFairs.css';
import { useNavigate } from "react-router-dom";

const ManageFairs = () => {
  const [fairs, setFairs] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFairs, setFilteredFairs] = useState([]);
  const [selectedFair, setSelectedFair] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token)

    }
  }, []);

  useEffect(() => {
    let result = [...fairs];

    if (filterStatus !== "all") {
      result = result.filter(fair => fair.status === filterStatus);
    }

    if (searchTerm) {
      result = result.filter(fair =>
        fair.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fair.organiserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fair.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fair.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFairs(result);
  }, [fairs, filterStatus, searchTerm]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        fetchFairs(token,data);

      } else {
        setMessage("Failed to fetch user profile");
      }
    } catch (error) {
      setMessage("Error fetching user profile: " + error.message);
    }
  };
  const fetchFairs = async (token,us) => {
    try {
      const response = await fetch(`http://localhost:3000/api/fairs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFairs(data);

      } else {

        setMessage(`Failed to fetch applications`);
      }
    } catch (error) {
      setMessage("Error fetching applications: " + error.message);
    }
  };



  const handleAction = async (fairId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/fairs/${fairId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setMessage(`Fair application ${status} successfully.`);
        await fetchFairs(token, user);

        // Clear the message after 3 seconds
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        const data = await response.json();
        setMessage(`Failed to update fair status: ${data.message}`);
      }
    } catch (error) {
      setMessage("Error updating fair status: " + error.message);
    }
  };
  const handleDelete = async (fairId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/fairs/${fairId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setMessage("Application deleted successfully.");
        await fetchFairs(token, user);
      } else {
        setMessage("Failed to delete application.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const handleShowDetails = (fair) => {
    setSelectedFair(fair);
    setShowDetailsModal(true);
  };

  const DetailsModal = ({ fair, onClose }) => {
    if (!fair) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Fair Details</h2>

          <div className="details-grid">
            <div className="detail-item">
              <label>School Name:</label>
              <p>{fair.schoolName || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Organiser Name:</label>
              <p>{fair.organiserName || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>City:</label>
              <p>{fair.city || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Date:</label>
              <p>{new Date(fair.fairDate).toLocaleDateString() || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Time:</label>
              <p>{fair.fairTime || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Email:</label>
              <p>{fair.email || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Phone Number:</label>
              <p>{fair.phoneNumber || "N/A"}</p>
            </div>

            <div className="detail-item">
              <label>Status:</label>
              <p className={`status-badge ${fair.status}`}>
                {fair.status.charAt(0).toUpperCase() + fair.status.slice(1)}
              </p>
            </div>

            <div className="detail-item full-width">
              <label>Full Address:</label>
              <p>{fair.location || "N/A"}</p>
            </div>

            <div className="detail-item full-width">
              <label>Additional Notes:</label>
              <p className="notes">{fair.additionalNotes || "No additional notes"}</p>
            </div>
          </div>

          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  };

  const sendDebugNotification = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/notifications/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Debug Notification",
          message: "This is a test notification sent at " + new Date().toLocaleString(),
        }),
      });

      if (response.ok) {
        setMessage("Debug notification sent successfully!");
      } else {
        setMessage("Failed to send debug notification");
      }
    } catch (error) {
      setMessage("Error sending debug notification: " + error.message);
    }
  };

  return (
    <div className="fair-managenent-applications-container">
      <h1>Manage Fairs</h1>
      <button onClick={() => navigate("/dashboard/guide-management")} style={{ padding: "10px 20px" , width :"auto" }}>
          Assign Guides
      </button>
      <button
        onClick={sendDebugNotification}
        style={{
          width: "auto",
          padding: "8px 16px",
          marginLeft: "10px",
        }}
      >
        Send Debug Notification
      </button>

      {message && <p className="message">{message}</p>}

      <div className="controls-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by school, organiser, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <FiFilter className="filter-icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">completed</option>
          </select>
        </div>
      </div>

      {filteredFairs.length > 0 ? (
        <table>
          <thead>
            <tr>
              {(
                <>
                  <th>High School Name</th>
                  <th>Organiser Name</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Applicant Email</th>
                  <th>Applicant Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              ) }
            </tr>
          </thead>
          <tbody>
            {filteredFairs.map((app) => {
              let className = "";
              if (app.status === "accepted") {
                className = "accepted";
              } else if (app.status === "rejected") {
                className = "rejected";
              } else if (app.status === "pending"){
                className = "pending";
              } else {
                className = "completed";
              }



              return (
                <tr key={app._id} className={className}>

                    <>
                      <td>{app.schoolName || "N/A"}</td>
                      <td>{app.organiserName || "N/A"}</td>
                      <td>{app.city || "N/A"}</td>
                      <td>{new Date(app.fairDate).toLocaleDateString()}</td>
                      <td>{app.fairTime || "N/A"}</td>
                      <td>{app.email || "N/A"}</td>
                      <td>{app.phoneNumber || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${app.status}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button details"
                            onClick={() => handleShowDetails(app)}
                            title="Show Details"
                          >
                            <FiEye size={16} />
                          </button>
                          {app.status === "pending" && (
                            <>
                              <button
                                className="action-button accept"
                                onClick={() => handleAction(app._id, "accepted")}
                                title="Accept Application"
                              >
                                <FiCheck size={16} />
                              </button>
                              <button
                                className="action-button reject"
                                onClick={() => handleAction(app._id, "rejected")}
                                title="Reject Application"
                              >
                                <FiX size={16} />
                              </button>
                            </>
                          )}
                          <button
                            className="action-button delete"
                            onClick={() => handleDelete(app._id)}
                            title="Delete Application"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>

                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <div className="no-results">
          <p>No applications found matching your criteria.</p>
        </div>
      )}
      {showDetailsModal && (
        <DetailsModal
          fair={selectedFair}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default ManageFairs;