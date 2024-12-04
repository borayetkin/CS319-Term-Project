import React, { useState, useEffect } from "react";

const CompletedTours = () => {
  const [completedTours, setCompletedTours] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCompletedTours();
  }, []);

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

  console.log("completed tours:",completedTours );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Completed Tours</h1>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {completedTours.length > 0 ? (
            completedTours.map((tour, index) => (
              <tr key={tour._id}>
                <td>{index + 1}</td>
                <td>{tour.applicant?.name || "N/A"}</td>
                <td>{tour.city || "N/A"}</td>
                <td>{tour.visitDate ? new Date(tour.visitDate).toLocaleDateString() : "N/A"}</td>
                <td>{tour.visitTime || "N/A"}</td>
                <td>
                  {tour.assignedGuides?.length > 0 ? (
                    tour.assignedGuides.map((guide) => (
                      <div key={guide._id}>{guide.name}</div>
                    ))
                  ) : (
                    <div>No guides assigned</div>
                  )}
                </td>
                <td>
                  <button onClick={() => confirmTour(tour._id)}>Confirm</button>
                </td>
              </tr>
            ))
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
