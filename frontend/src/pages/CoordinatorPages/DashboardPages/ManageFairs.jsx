import React, { useState, useEffect } from "react";

const ManageFairs = () => {
  const [fairs, setFairs] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token)
      
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
      const response = await fetch(`http://localhost:3000/api/events/fairs`, {
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



  const handleAction = async (eventId, status) => {
    // To Be Implemented
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
        await fetchFairs(token,user); // Refresh applications
      } else {
        setMessage("Failed to delete application.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };


  return (
    <div className="applications-container">
      <h1>APPLICATIONS</h1>
      {message && <p>{message}</p>}
      <div className="controls-container">
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

</div>
      {fairs.length > 0 ? (
        <table>
          <thead>
            <tr>
              {(
                <>
                  <th>High School Name</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Applicant Name</th>
                  <th>Applicant Email</th>
                  <th>Applicant Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              ) }
            </tr>
          </thead>
          <tbody>
            {
            fairs.map((app) => {
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
                  
                    <>
                      <td>{app.schoolName || "N/A"}</td>
                      <td>{app.city || "N/A"}</td>
                      <td>{new Date(app.visitDate).toLocaleDateString()}</td>
                      <td>{app.visitTime || "N/A"}</td>
                      <td>{app.applicant.name || "N/A"}</td>
                      <td>{app.email || "N/A"}</td>
                      <td>{app.phoneNumber || "N/A"}</td>
                      <td>{app.status}</td>
                      <td>
                        <div className="button-container">
                            To Be Implemented
                        </div>
                      </td>
                    </>
                  
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p>No applications found.</p>
      )}
    </div>
  );
};

export default ManageFairs;