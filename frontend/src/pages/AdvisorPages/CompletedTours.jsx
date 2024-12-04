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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCompletedTours(data);
      } else {
        setMessage("Failed to fetch completed tours.");
      }
    } catch (error) {
      setMessage("Error fetching completed tours: " + error.message);
    }
  };

  const confirmTour = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/confirm/${eventId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage("Tour confirmed successfully!");
        fetchCompletedTours();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm the tour");
      }
    } catch (error) {
      setMessage("Error confirming the tour: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Completed Tours</h1>
      {message && <p>{message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>High School</th>
            <th>City</th>
            <th>Date</th>
            <th>Time</th>
            <th>Assigned Guides</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {completedTours.map((tour, index) => (
            <tr key={tour._id}>
              <td>{index + 1}</td>
              <td>{tour.highSchool}</td>
              <td>{tour.city}</td>
              <td>{new Date(tour.date).toLocaleDateString()}</td>
              <td>{tour.time}</td>
              <td>
                {tour.assignedGuides.map((guide) => (
                  <div key={guide._id}>{guide.name}</div>
                ))}
              </td>
              <td>
                <button onClick={() => confirmTour(tour._id)}>Confirm</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedTours;
