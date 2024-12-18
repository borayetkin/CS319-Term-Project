import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Event.css";
import "../styles/TourApplication.css";
import LoadingSpinner from "../components/LoadingSpinner";

const Event = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const eventData = await response.json();
        setEvent(eventData);
        setEditedEvent(eventData);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDateForInput = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split("T")[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent changes to the date field
      if (name === "visitDate") {
        setEditedEvent({ ...editedEvent, [name]: new Date(value).toISOString() });
        return;
      }
      setEditedEvent({ ...editedEvent, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      // Only send updated fields, excluding the date
      const updatedFields = {};
      for (let key in editedEvent) {
        if (editedEvent[key] !== event[key]) {
          updatedFields[key] = editedEvent[key];
        }
      }

      const response = await fetch(`http://localhost:3000/api/events/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const updatedEvent = await response.json();
      setEvent(updatedEvent);
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };
  const roomOptions = ["B205", "FFB-22", "FFB-05", "FFB-06", "EE-01", "MitatCoruh"];

  return (
    <>
      {isLoading && <LoadingSpinner loading="Event" />}
      {error && <div>{error}</div>}
      {!isLoading && event && (
        <div className="event-container">
          <div className="event-info">
            {isEditing ? (
              <>
                <label htmlFor="visitDate:" style={{ marginRight: "8px", fontWeight: "bold" }}>Visit date:</label>
                <input
                  type="date"
                  name="visitDate"
                  value={formatDateForInput(editedEvent.visitDate || "")}
                  onChange={handleInputChange}
                  placeholder="enter the new date"
                />
                {event.__t === "SchoolTour" && (
                  <>
                  <label htmlFor="student count" style={{ marginRight: "8px", fontWeight: "bold" }}>Student Number:</label>
                  <input
                    type="number"
                    name="studentCount"
                    value={editedEvent.studentCount || ""}
                    onChange={handleInputChange}
                    placeholder="enter the student number"
                  />
                   <label htmlFor="reservedRoom" style={{ marginRight: "8px", fontWeight: "bold" }}>Reserved Room:</label>
                   <select
                     name="reservedRoom"
                     value={editedEvent.reservedRoom || ""}
                     onChange={handleInputChange}
                     style={{
                         padding: "8px",
                         borderRadius: "4px",
                         border: "1px solid #ccc",
                         boxSizing: "border-box",
                         fontSize: "inherit",
                       }}
                   >
                     <option value="" disabled>Select a room</option>
                       {roomOptions.map((room) => (
                         <option key={room} value={room}>{room}</option>
                       ))}
                     </select>
                  </>
                )}
                <>
                <label htmlFor="guide number" style={{ marginRight: "8px", fontWeight: "bold" }}>Guide Number:</label>
                <input
                  name="requiredNumberOfGuides"
                  type="number"
                  value={editedEvent.requiredNumberOfGuides || ""}
                  onChange={handleInputChange}
                  placeholder="enter the required guide number"
                ></input>
                <label htmlFor="advisor notes" style={{ marginRight: "8px", fontWeight: "bold" }}>Advisor Notes:</label>
                <textarea
                  name="advisorNotes"
                  value={editedEvent.advisorNotes || ""}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "advisorNotes", value: e.target.value },
                    })
                  }
                  placeholder="Write your advisor notes here..."
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    minHeight: "50px",
                    borderRadius: "5px",
                    marginBottom: "10px",
                    width: "100%",
                    boxSizing: "border-box",
                    resize: "none", // Prevent resizing if you want a fixed height
                    fontFamily: "inherit", // Matches the parent font
                    fontSize: "inherit",
                    textAlign: "left",
                    direction: "ltr", // Ensures left-to-right text
                  }}
                />
                <button onClick={handleSaveChanges}>Save Changes</button>
                </>
              </>
            ) : (
              <>
                  {event.__t === "IndividualTours" && (
                    <>
                      <h1>{event.studentHighSchool}</h1>
                      <p>Date: {new Date(event.visitDate).toLocaleDateString()}</p>
                      <p>Student name: {event.studentName || "N/A"}</p>
                    </>
                  )}
                  {event.__t === "SchoolTour" && (
                    <>
                      <h1>{event.schoolName}</h1>
                      <p>Date: {new Date(event.visitDate).toLocaleDateString()}</p>
                      <p>Student Number: {event.studentCount || "N/A"}</p>
                      <p>Reserved Room: {event.reservedRooms || "N/A"}</p>
                    </>
                  )}
                  <p>Number of Guides: {event.requiredNumberOfGuides || "N/A"}</p>
                  <p>Additional Notes: {event.additionalNotes || "N/A"}</p>
                  <p>Advisor Notes: {event.advisorNotes || "N/A"}</p>
                  <button onClick={() => setIsEditing(true)}>Edit</button>
              </>
            )}
          </div>
          <button className="return-button" onClick={() => navigate("/manage-guides")}>
            Return to Manage Guides
          </button>
        </div>
      )}
    </>
  );
};

export default Event;
