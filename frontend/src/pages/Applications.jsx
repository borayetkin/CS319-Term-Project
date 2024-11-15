import React, { useState, useEffect } from "react";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchApplications(token);
    }
  }, []);

  const fetchApplications = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setMessage("Failed to fetch applications");
      }
    } catch (error) {
      setMessage("Error fetching applications: " + error.message);
    }
  };

  const handleAction = async (eventId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (response.ok) {
        setMessage(`Application ${status} successfully.`);
        fetchApplications(token); // Refresh applications
      } else {
        setMessage(`Failed to ${status} application.`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  return (
    <div className="applications-container">
      <h1>Applications</h1>
      {message && <p>{message}</p>}
      <div className="filter-controls">
        <label htmlFor="filter">Filter by Status:</label>
        <select
          id="filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {filteredApplications.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app._id}>
                <td>{app.applicant || "N/A"}</td>
                <td>{app.typeStr}</td>
                <td>{new Date(app.visitDate).toLocaleDateString()}</td>
                <td>{app.status}</td>
                <td>
                  {app.status === "pending" && (
                    <>
                      <button onClick={() => handleAction(app._id, "accepted")}>
                        Accept
                      </button>
                      <button onClick={() => handleAction(app._id, "rejected")}>
                        Decline
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No applications found.</p>
      )}
    </div>
  );
};

export default Applications;
