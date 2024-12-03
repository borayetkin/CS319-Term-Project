import React, { useState, useEffect } from "react";

const ManageGuides = () => {
  const [events, setEvents] = useState([]);
  const [guides, setGuides] = useState([]);
  const [updatedAssignments, setUpdatedAssignments] = useState({});
  const [updatedRemovals, setUpdatedRemovals] = useState({});
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEvents();
    fetchGuides();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const eventsData = await response.json();

        const eventsWithAssignees = await Promise.all(
          eventsData.map(async (event) => {
            const assigneesResponse = await fetch(
              `http://localhost:3000/api/events/${event._id}/assignees`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const assignees = assigneesResponse.ok
              ? await assigneesResponse.json()
              : [];
            return { ...event, assignedGuides: assignees };
          })
        );

        setEvents(eventsWithAssignees);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGuides(data);
      } else {
        setMessage("Failed to fetch guides.");
      }
    } catch (error) {
      setMessage("Error fetching guides: " + error.message);
    }
  };

  const saveChanges = async (eventId) => {
    const guideToAssign = updatedAssignments[eventId];
    const guideToRemove = updatedRemovals[eventId];

    try {
      // Assign new guide
      if (guideToAssign) {
        const assignResponse = await fetch(
          "http://localhost:3000/api/events/assign-guide",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userID: guideToAssign,
              eventID: eventId,
            }),
          }
        );

        if (!assignResponse.ok) {
          const errorData = await assignResponse.json();
          throw new Error(errorData.message || "Failed to assign guide");
        }
      }

      // Remove selected guide
      if (guideToRemove) {
        const removeResponse = await fetch(
          "http://localhost:3000/api/events/remove-guide",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userID: guideToRemove,
              eventID: eventId,
            }),
          }
        );

        if (!removeResponse.ok) {
          const errorData = await removeResponse.json();
          throw new Error(errorData.message || "Failed to remove guide");
        }
      }

      setMessage("Changes saved successfully!");
      fetchEvents(); // Refresh the events list
    } catch (error) {
      setMessage("Error saving changes: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Event Guide Management</h1>
      {message && <p>{message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>High School</th>
            <th>City</th>
            <th>Date</th>
            <th>Time</th>
            <th>number of visitors</th>
            <th>Assigned Guides</th>
            <th>Assign New Guide</th>
            <th>Remove Guide</th>
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
              <th>{event.studentCount}</th>
              <td>
                {event.assignedGuides.map((guide) => (
                  <div key={guide._id}>{guide.name}</div>
                ))}
              </td>
              <td>
                <select
                  onChange={(e) =>
                    setUpdatedAssignments((prev) => ({
                      ...prev,
                      [event._id]: e.target.value,
                    }))
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Guide
                  </option>
                  {guides
                    .filter(
                      (guide) =>
                        !event.assignedGuides.some(
                          (assigned) => assigned._id === guide._id
                        )
                    )
                    .map((guide) => (
                      <option key={guide._id} value={guide._id}>
                        {guide.name}
                      </option>
                    ))}
                </select>
              </td>
              <td>
                <select
                  onChange={(e) =>
                    setUpdatedRemovals((prev) => ({
                      ...prev,
                      [event._id]: e.target.value,
                    }))
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Guide
                  </option>
                  {event.assignedGuides.map((guide) => (
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
