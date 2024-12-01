import React, { useState, useEffect } from "react";

const ManageGuides = () => {
  const [events, setEvents] = useState([]);
  const [guides, setGuides] = useState([]);
  const [updatedAssignments, setUpdatedAssignments] = useState({});
  const [message, setMessage] = useState("");

  // Replace this with your actual token retrieval mechanism
  const token = localStorage.getItem("token");

  // Fetch all events and guides when the component loads
  useEffect(() => {
    fetchEvents();
    fetchGuides();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setMessage("Failed to fetch events.");
      }
    } catch (error) {
      setMessage("Error fetching events: " + error.message);
    }
  };

  const fetchGuides = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/guides", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGuides(data);
      } else {
        setMessage("Failed to fetch guides (react).");
      }
    } catch (error) {
      setMessage("Error fetching guides: " + error.message);
    }
  };

  const handleGuideChange = (eventId, guideId) => {
    setUpdatedAssignments((prev) => ({
      ...prev,
      [eventId]: guideId,
    }));
  };

  const saveChanges = async (eventId) => {
    const guideId = updatedAssignments[eventId];
    if (!guideId) {
      setMessage("Please select a guide before saving.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/events/assign-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userID: guideId,
          eventID: eventId,
        }),
      });

      if (response.ok) {
        setMessage("Guide assigned successfully!");
        fetchEvents(); // Refresh the events list
      } else {
        const errorData = await response.json();
        setMessage(`Failed to assign guide: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("Error saving changes: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Event Guide Assignment</h1>
      {message && <p>{message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>High School</th>
            <th>City</th>
            <th>Date</th>
            <th>Time</th>
            <th>Student No</th>
            <th>Assigned Person</th>
            <th>Person Number</th>
            <th>Assigned Person Email</th>
            <th>Choose Guide</th>
            <th>Save Changes</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event._id}>
              <td>{index + 1}</td>
              <td>{event.highSchool}</td>
              <td>{event.city}</td>
              <td>{new Date(event.date).toLocaleDateString()}</td>
              <td>{event.time}</td>
              <td>{event.studentNo}</td>
              <td>{event.assignedGuide?.name || "None"}</td>
              <td>{event.assignedGuide?.phone || "N/A"}</td>
              <td>{event.assignedGuide?.email || "N/A"}</td>
              <td>
                <select
                  onChange={(e) => handleGuideChange(event._id, e.target.value)}
                  defaultValue={event.assignedGuide?._id || ""}
                >
                  <option value="" disabled>
                    Choose Guide
                  </option>
                  {guides.map((guide) => (
                    <option key={guide._id} value={guide._id}>
                      {guide.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => saveChanges(event._id)}>Save Changes</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageGuides;
