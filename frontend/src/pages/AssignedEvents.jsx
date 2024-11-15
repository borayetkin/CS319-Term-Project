import React, { useState, useEffect } from "react";

const AssignedEvents = () => {
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAssignedEvents(token);
    }
  }, []);

  const fetchAssignedEvents = async (token) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/events/assigned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssignedEvents(data);
      } else {
        setMessage("Failed to fetch assigned events.");
      }
    } catch (error) {
      setMessage("Error fetching assigned events: " + error.message);
    }
  };

  return (
    <div className="assigned-events-container">
      <h1>Assigned Events</h1>
      {message && <p>{message}</p>}
      {assignedEvents.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignedEvents.map((event) => (
              <tr key={event._id}>
                <td>{event.name || "N/A"}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{new Date(event.date).toLocaleTimeString()}</td>
                <td>{event.location || "N/A"}</td>
                <td>{event.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No events assigned yet.</p>
      )}
    </div>
  );
};

export default AssignedEvents;
