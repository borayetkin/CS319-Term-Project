import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CompletedTours = () => {
  const [completedTours, setCompletedTours] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  useEffect(() => {
    fetchCompletedTours();
  }, []);
  const personIconUrl =
  "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const fetchCompletedTours = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/events/completed", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompletedTours(data);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to fetch completed tours.");
      }
    } catch (error) {
      setMessage("Error fetching completed tours: " + error.message);
    }
  };

  const confirmTour = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/confirm-action/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setMessage("Tour confirmed successfully!");
        fetchCompletedTours(); // Refresh tours after confirmation
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm the tour.");
      }
    } catch (error) {
      setMessage("Error confirming the tour: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
     
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Completed Tours</h1>
        <button onClick={() => navigate("/manage-guides")} style={{ padding: "10px 20px" , width :"auto" }}>
          View Event Guide Management
        </button>
      </div>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Applicant</th>
            <th>City</th>
            <th>Date</th>
            <th>Time</th>
            <th>Assigned Guides</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {completedTours.length > 0 ? (
            completedTours.map((tour, index) => {
              const eventIsConfirmed = !tour.status.includes("non-verified") && tour.status !== "accepted";
              
              return (
              
              <tr key={tour._id}>
                <td>{index + 1}</td>
                <td>{tour.applicant?.name || "N/A"}</td>
                <td>{tour.city || "N/A"}</td>
                <td>{tour.visitDate ? new Date(tour.visitDate).toLocaleDateString() : "N/A"}</td>
                <td>{tour.visitTime || "N/A"}</td>
                <td>
                {tour.assignedUsers.map((guide) => (
                  <div key={guide._id} style={{display : "flex", alignItems : "center",gap : "5px"}}>
                    <img
                        src={personIconUrl}
                        alt={guide.name}
                        title={guide.name}
                        style={{ width: "20px", height: "20px",cursor: "pointer" }}
                      />
                    {guide.name}</div>
                ))}
                </td>
                <td>
                  {tour.status.replace(/-/g, ' ')}
                </td>
                <td>
                {!eventIsConfirmed ? <button onClick={() => confirmTour(tour._id)}>Confirm</button>:
                        <div style={{color : 'gray'}}>Event Is Confirmed</div>}
                </td>
              </tr>
            )})
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No completed tours found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedTours;
