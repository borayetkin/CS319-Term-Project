import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [sortOption, setSortOption] = useState("visitDate");
  const [showIndividualTours, setShowIndividualTours] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchEvents(token); // Fetch events if logged in
    }
  }, []);

  const fetchEvents = async (token) => {
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
        console.error("Error fetching events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const sortEvents = (events, option) => {
    return [...events].sort((a, b) => {
      if (option === "applicant") {
        return a.applicant.localeCompare(b.applicant);
      } else if (option === "visitDate") {
        return new Date(a.visitDate) - new Date(b.visitDate);
      } else if (option === "requiredNumberOfGuides") {
        return b.requiredNumberOfGuides - a.requiredNumberOfGuides;
      }
      return 0;
    });
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredEvents = events.filter((event) =>
    showIndividualTours
      ? event.__t === "IndividualTour"
      : event.__t === "SchoolTour"
  );

  const toggleEventType = () => {
    setShowIndividualTours(!showIndividualTours);
  };

  const sortedEvents = sortEvents(filteredEvents, sortOption);

  const handleDecline = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "rejected" }),
        }
      );

      if (response.ok) {
        setEvents(events.filter((event) => event._id !== eventId));
      } else {
        console.error("Failed to decline application");
      }
    } catch (error) {
      console.error("Error declining application:", error);
    }
  };

  const handleAccept = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "accepted" }),
        }
      );

      if (response.ok) {
        setEvents(
          events.map((event) =>
            event._id === eventId ? { ...event, status: "accepted" } : event
          )
        );
      } else {
        console.error("Failed to accept application");
      }
    } catch (error) {
      console.error("Error accepting application:", error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Event Dashboard</h1>

      <div className="filter-controls">
        <button onClick={toggleEventType} className="toggle-button">
          {showIndividualTours ? "Show School Tours" : "Show Individual Tours"}
        </button>

        <div className="sort-options">
          <label htmlFor="sort">Sort by:</label>
          <select id="sort" value={sortOption} onChange={handleSortChange}>
            <option value="visitDate">Visit Date</option>
            <option value="applicant">Applicant</option>
            <option value="requiredNumberOfGuides">Required Guides</option>
          </select>
        </div>
      </div>

      {sortedEvents.length > 0 ? (
        <table className="event-table">
          <thead>
            <tr>
              {showIndividualTours ? (
                <>
                  <th>High School</th>
                  <th>Student Name</th>
                </>
              ) : (
                <>
                  <th>School Name</th>
                  <th>Contact Person</th>
                </>
              )}
              <th>Event Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              {!showIndividualTours && <th>Student Count</th>}
              <th>Required Guides</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((event) => (
              <tr key={event._id}>
                {showIndividualTours ? (
                  <>
                    <td>{event.studentHighSchool || "N/A"}</td>
                    <td>{event.studentName || "N/A"}</td>
                  </>
                ) : (
                  <>
                    <td>{event.schoolName || "N/A"}</td>
                    <td>{event.contactPerson || "N/A"}</td>
                  </>
                )}
                <td>{event.typeStr}</td>
                <td>{new Date(event.visitDate).toLocaleDateString()}</td>
                <td>{new Date(event.visitDate).toLocaleTimeString()}</td>
                <td>{event.city || event.location || "N/A"}</td>
                {!showIndividualTours && <td>{event.studentCount || "N/A"}</td>}
                <td>{event.requiredNumberOfGuides || 1}</td>
                <td>{event.status.toUpperCase()}</td>
                <td>{event.additionalNotes || "N/A"}</td>
                <td>
                  {event.status === "pending" && (
                    <>
                      <button onClick={() => handleAccept(event._id)}>
                        Accept
                      </button>
                      <button onClick={() => handleDecline(event._id)}>
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
        <p>No events found.</p>
      )}
    </div>
  );
};

export default Dashboard;
