import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/GuidePages/Events.css";
import LoadingSpinner from "../../components/LoadingSpinner";

const PastEvents = ({ setShowPastEvents }) => {
  const [completedEvents, setCompletedEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCompletedEvents(token);
    }
  }, []);
  const fetchCompletedEvents = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/events/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();

        const pastEvents = data.filter(
          (event) => new Date(event.visitDate) < new Date()
        );

        setCompletedEvents(pastEvents);
        setIsLoading(false);
      } else {
        setMessage("Failed to fetch completed events.");
        setIsLoading(false);
      }
    } catch (error) {
      setMessage("Error fetching completed events: " + error.message);
      setIsLoading(false);
    }
  };
  const handleMarkCompleted = async (eventId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setCompletedEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId
              ? { ...event, status: "completed-non-verified" }
              : event
          )
        );
      } else {
        setMessage("Failed to mark event as completed.");
      }
    } catch (error) {
      setMessage("Error marking event as completed: " + error.message);
    }
  };
  const handleMarkCanceled = async (eventId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setCompletedEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId
              ? { ...event, status: "canceled-non-verified" }
              : event
          )
        );
      } else {
        setMessage("Failed to mark event as canceled.");
      }
    } catch (error) {
      setMessage("Error marking event as canceled: " + error.message);
    }
  };
  const takeBackAction = async (eventId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}/take-back`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setCompletedEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId ? { ...event, status: "accepted" } : event
          )
        );
      } else {
        setMessage("Failed to mark event as canceled.");
      }
    } catch (error) {
      setMessage("Error marking event as canceled: " + error.message);
    }
  };

  return (
    <div className="events-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h1>Assigned Past Events</h1>

        <button
          style={{ width: "auto" }}
          onClick={() => {
            setShowPastEvents(false);
            console.log("wtf");
          }}
        >
          View Assigned Events
        </button>
      </div>

      {message && <p>{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {completedEvents.length > 0 ? (
            completedEvents.map((event) => {
              const eventIsConfirmed =
                !event.status.includes("non-verified") &&
                event.status !== "accepted";
              return (
                <tr key={event._id}>
                  <td>{event.applicant.name || "N/A"}</td>
                  <td>{new Date(event.visitDate).toLocaleDateString()}</td>
                  <td>{new Date(event.visitDate).toLocaleTimeString()}</td>

                  <td>{event.status.replace(/-/g, " ")}</td>

                  <td>
                    {!eventIsConfirmed ? (
                      event.status === "accepted" ? (
                        <>
                          <button
                            onClick={() => handleMarkCompleted(event._id)}
                          >
                            Mark Completed
                          </button>
                          <button onClick={() => handleMarkCanceled(event._id)}>
                            Mark Canceled
                          </button>
                        </>
                      ) : (
                        <button onClick={() => takeBackAction(event._id)}>
                          Cancel Mark
                        </button>
                      )
                    ) : (
                      <div style={{ color: "gray" }}>Event Is Confirmed</div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : isLoading ? (
            <tr>
              <td
                colSpan="100"
                style={{ textAlign: "center", background: "none" }}
              >
                <LoadingSpinner loading="Past Events" />
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan="100" style={{ textAlign: "center" }}>
                No past events found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PastEvents;
