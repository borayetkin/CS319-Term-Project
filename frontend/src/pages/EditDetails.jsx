import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/Event.css";
import "../styles/TourApplication.css";
import LoadingSpinner from "../components/LoadingSpinner";

const Event = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [advisorNotes, setAdvisorNotes] = useState("");
  const [studentCount, setStudentCount] = useState(0);
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
        setStudentCount(eventData.studentCount || 0);
        setAdditionalNotes(eventData.additionalNotes || "");
        setAdvisorNotes(eventData.advisorNotes || "");
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent({ ...editedEvent, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/events/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedEvent),
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

  const handleStudentCountChange = (e) => {
    setStudentCount(e.target.value)
  };

  const handleNoteChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  const handleAdvisorNoteChange = (e) => {
    setAdvisorNotes(e.target.value);
  };

  const handleAddNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/events/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ additionalNotes, advisorNotes }),
      });
      if (!response.ok) {
        throw new Error("Failed to save notes");
      }
      const updatedEvent = await response.json();
      setEvent(updatedEvent);
      setAdditionalNotes("");
      setAdvisorNotes("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner loading="Event" />}
      {error && <div>{error}</div>}
      {!isLoading && event && (
        <div className="event-container">
          <div className="event-info">
            {isEditing ? (
              <>
                <input
                  type="Number"
                  name="studentCount"
                  value={editedEvent.studentCount}
                  onChange={handleInputChange}
                />
                <textarea
                  name="additionalNotes"
                  value={editedEvent.additionalNotes || ""}
                  onChange={handleInputChange}
                ></textarea>
                <button onClick={handleSaveChanges}>Save Changes</button>
              </>
            ) : (
              <>
                <h1>{event.schoolName}</h1>
                <p>Date: {new Date(event.visitDate).toLocaleDateString()}</p>
                <p>studentNumber: {event.studentCount || "N/A"}</p>
                <p>Additional Notes: {event.additionalNotes || "N/A"}</p>
                <p>Advisor Notes: {event.advisorNotes || "N/A"}</p>
                <button onClick={() => setIsEditing(true)}>Edit</button>
              </>
            )}
          </div>
          <div className="additional-notes">
            <h3>Leave Notes</h3>
            <textarea
              value={advisorNotes}
              onChange={handleAdvisorNoteChange}
              placeholder="Write advisor notes here..."
            ></textarea>
            <button onClick={handleAddNotes}>Save Notes</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Event;