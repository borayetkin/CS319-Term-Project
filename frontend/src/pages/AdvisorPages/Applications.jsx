import React, { useState, useEffect } from "react";
import "../../styles/AdvisorPages/Applications.css";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);
  const [tourType, setTourType] = useState("SchoolTour");

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
        await fetchApplications(token,data);

      } else {
        setMessage("Failed to fetch user profile");
      }
    } catch (error) {
      setMessage("Error fetching user profile: " + error.message);
    }
  };
  const fetchApplications = async (token,us) => {
    try {
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
        await data.forEach(async (application) => {

          await fetchApplicant(application.applicant.applicantID).then((applicantData) => {
            application.applicant = applicantData;
          });
        });
       
   
        
        setApplications(data);
        
      } else {

        setMessage(`Failed to fetch applications`);
      }
    } catch (error) {
      setMessage("Error fetching applications: " + error.message);
    }
  };

  const fetchApplicant = async (applicantId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/applicants/${applicantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        setMessage("Failed to fetch applicant");
      }
    } catch (error) {
      setMessage("Error fetching applicant: " + error.message);
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
        await fetchApplications(token,user); // Refresh applications
        setTourType("SchoolTour")
      } else {
        const errData = await response.json();

        setMessage(`Failed to ${status} application: ${errData.message}`);
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
        await fetchApplications(token,user); // Refresh applications
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
    if (tourType !== "all" && app.__t !== tourType) {
      return false;
    }
    if (user && user.role === "advisor" && user.assignedDay) {

      
      const visitDay = app.weekday;
      return visitDay === user.assignedDay;
    }
    return true;
  });
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
  <div className="tour-type-controls">
    <button onClick={() => setTourType(tourType === "SchoolTour" ? "IndividualTour" : "SchoolTour")}>
      {tourType === "SchoolTour" ? "Show Individual Tours" : "Show School Tours"}
    </button>
  </div>
</div>
      {filteredApplications.length > 0 ? (
        <table>
          <thead>
            <tr>
              {tourType === "SchoolTour" ? (
                <>
                  <th>High School Name</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Student Amount</th>
                  <th>Applicant Name</th>
                  <th>Applicant Email</th>
                  <th>Applicant Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              ) : (
                <>
                  <th>Applicant Name</th>
                  <th>Student High School</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Person Email</th>
                  <th>Person Number</th>
                  <th>Major of Interest</th>
                  <th>Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {
            filteredApplications.map((app) => {
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
                  {tourType === "SchoolTour" ? (
                    <>
                      <td>{app.schoolName || "N/A"}</td>
                      <td>{app.city || "N/A"}</td>
                      <td>{new Date(app.visitDate).toLocaleDateString()}</td>
                      <td>{app.visitTime || "N/A"}</td>
                      <td>{app.studentCount || "N/A"}</td>
                      <td>{app.contactPerson || "N/A"}</td>
                      <td>{app.email || "N/A"}</td>
                      <td>{app.phoneNumber || "N/A"}</td>
                      <td>{app.status}</td>
                      <td>
                        <div className="button-container">
                          {app.status === "pending" && (
                            <>
                              <button className="accept" onClick={() => handleAction(app._id, "accepted")}>
                                Accept
                              </button>
                              <button className="decline" onClick={() => handleAction(app._id, "rejected")}>
                                Decline
                              </button>
                            </>
                          )}
                          <button className="delete" onClick={() => handleDelete(app._id)}>Delete</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{app.studentName || "N/A"}</td>
                      <td>{app.studentHighSchool || "N/A"}</td>
                      <td>{new Date(app.visitDate).toLocaleDateString()}</td>
                      <td>{app.visitTime || "N/A"}</td>
                      <td>{app.applicant.email   || "N/A"}</td>
                      <td>{app.applicant.phoneNumber || "N/A"}</td>
                      <td>{app.majorOfInterest || "N/A"}</td>
                      <td>
                        <div className="button-container">
                          {app.status === "pending" && (
                            <>
                              <button className="accept" onClick={() => handleAction(app._id, "accepted")}>
                                Accept
                              </button>
                              <button className="decline" onClick={() => handleAction(app._id, "rejected")}>
                                Decline
                              </button>
                            </>
                          )}
                          <button className="delete" onClick={() => handleDelete(app._id)}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
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