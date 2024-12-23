import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EditDetails.module.css"; // Import the CSS module

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
    console.log("Input Changed:", { name, value });
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
      {error && <div className={styles.error}>{error}</div>}
      {!isLoading && event && (
        <div className={styles.eventContainer}>
          <div className={styles.eventInfo}>
            {isEditing ? (
              <>
                <label htmlFor="visitDate:" className={styles.label}>Visit date:</label>
                <input
                  type="date"
                  name="visitDate"
                  value={formatDateForInput(editedEvent.visitDate || "")}
                  onChange={handleInputChange}
                  placeholder="enter the new date"
                  className={styles.input}
                />
                {event.__t === "SchoolTour" && (
                  <>
                  <label htmlFor="student count" className={styles.label}>Student Number:</label>
                  <input
                    type="number"
                    name="studentCount"
                    value={editedEvent.studentCount || ""}
                    onChange={handleInputChange}
                    placeholder="enter the student number"
                    className={styles.input}
                  />
                   <label htmlFor="reservedRooms" className={styles.label}>Reserved Room:</label>
                   <select
                     name="reservedRooms"
                     value={editedEvent.reservedRooms || ""}
                     onChange={handleInputChange}
                     className={styles.select}
                   >
                     <option value="" disabled>Select a room</option>
                       {roomOptions.map((room) => (
                         <option key={room} value={room}>{room}</option>
                       ))}
                     </select>
                  </>
                )}
                <>
                <label htmlFor="guide number" className={styles.label}>Guide Number:</label>
                <input
                  name="requiredNumberOfGuides"
                  type="number"
                  value={editedEvent.requiredNumberOfGuides || ""}
                  onChange={handleInputChange}
                  placeholder="enter the required guide number"
                  className={styles.input}
                ></input>
                <label htmlFor="advisor notes" className={styles.label}>Advisor Notes:</label>
                <textarea
                  name="advisorNotes"
                  value={editedEvent.advisorNotes || ""}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "advisorNotes", value: e.target.value },
                    })
                  }
                  placeholder="Write your advisor notes here..."
                  className={styles.textarea}
                />
                <div className={styles.buttonContainer}>
                  <button onClick={handleSaveChanges} className={styles.saveButton}>Save Changes</button>
                  <button className={styles.returnButton} onClick={() => navigate("/manage-guides")}>
                    Return to Manage Guides
                  </button>
                </div>
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
                  <div className={styles.buttonContainer}>
                    <button onClick={() => setIsEditing(true)} className={styles.editButton}>Edit</button>
                    <button className={styles.returnButton} onClick={() => navigate("/manage-guides")}>
                      Return to Manage Guides
                    </button>
                  </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Event;
