import React, { useState, useEffect } from "react";
import "../../styles/AdvisorPages/Applications.css";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
      
    }
  }, []);
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
        fetchApplications(token,data);
      } else {
        setMessage("Failed to fetch user profile");
      }
    } catch (error) {
      setMessage("Error fetching user profile: " + error.message);
    }
  };
  const fetchApplications = async (token,us) => {
    try {
      console.log(us);
      
      const response = us.role === "advisor" ? await fetch(`http://localhost:3000/api/events/advisor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }) :await fetch(`http://localhost:3000/api/events/`, {
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
            userrole: user.role,
            userid : user._id,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (response.ok) {
        setMessage(`Application ${status} successfully.`);
        fetchApplications(token,user); // Refresh applications
      } else {
        setMessage(`Failed to ${status} application.`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };
  const handleDelete = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setMessage("Application deleted successfully.");
        fetchApplications(token,user); // Refresh applications
      } else {
        setMessage("Failed to delete application.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus !== "all" && app.status !== filterStatus) {
      return false;
    }
    if (user && user.role === "advisor" && user.assignedDay) {
      console.log(app.weekday);
      
      const visitDay = app.weekday;
      return visitDay === user.assignedDay;
    }
    return true;
  });
  return (
    <div className="applications-container">
      <h1>APPLICATIONS</h1>
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
            {filteredApplications.map((app) => {
              let className = "";
              if (app.status === "accepted") {
                className = "accepted";
              } else if (app.status === "rejected") {
                className = "rejected";
              } else {
                className = "pending";
              }

              return (
                <tr key={app._id} className={className}>
                  <td>{app.applicant.name || "N/A"}</td>
                  <td>{app.__t}</td>
                  <td>{new Date(app.visitDate).toLocaleDateString()}</td>
                  <td>{app.status}</td>
                  <td>
                    {app.status === "pending" && (
                      <>
                        <button className="accept" onClick={() => handleAction(app._id, "accepted")}>
                          Accept
                        </button>
                        <button className= "delete" onClick={() => handleAction(app._id, "rejected")}>
                          Decline
                        </button>
                        <button className="delete" onClick={() => handleDelete(app._id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No applications found.</p>
      )}
    </div>
  );
};

export default Applications;