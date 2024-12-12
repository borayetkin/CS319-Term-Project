import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/GuidePages/Events.css";

import LoadingSpinner from "../../components/LoadingSpinner";
import GeneralTable from "../../components/GeneralTable";
import AssignedEventsActions from "../../components/AssignedEventsActions";
import TypeSelectionTrio from "../../components/TypeSelectionTrio";

const AssignedEvents = () => {
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [tourType, setTourType] = useState("SchoolTour");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAssignedEvents(token);
      fetchUserProfile(token);
    }
  }, []);
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      setError(error.message);
    }
  };
  const fetchAssignedEvents = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/events/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setAssignedEvents(data);
        setIsLoading(false);
      } else {
        setMessage("Failed to fetch assigned events.");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Error fetching assigned events: " + error.message);
    }
  };

  const handleCompleteEvent = async (eventId, workHours) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/events/${eventId}/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ workHours }),
          }
        );

        if (response.ok) {
          // Update the event status in state to mark it as completed
          setAssignedEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === eventId
                ? { ...event, status: "completed-non-verified" }
                : event
            )
          );
        } else {
          alert("Failed to complete the event.");
        }
      } catch (error) {
        console.error("Error completing event:", error);
      }
    }
  };
  const handleMarkCanceled = async (eventId) => {
    const token = localStorage.getItem("token");
    if (token) {
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
          // Update the event status in state to mark it as canceled
          setAssignedEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === eventId
                ? { ...event, status: "canceled-verified" }
                : event
            )
          );
        } else {
          alert("Failed to cancel the event.");
        }
      } catch (error) {
        console.error("Error canceling event:", error);
      }
    }
  };
  const handleTakeBack = async (eventId) => {
    const token = localStorage.getItem("token");
    if (token) {
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
          // Update the event status in state to mark it as accepted
          setAssignedEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === eventId ? { ...event, status: "accepted" } : event
            )
          );
        } else {
          alert("Failed to take back the event.");
        }
      } catch (error) {
        console.error("Error taking back event:", error);
      }
    }
  };
  const filteredEvents = assignedEvents.filter(
    (event) =>
      ((showPastEvents && new Date(event.visitDate) < new Date()) ||
      (!showPastEvents && new Date(event.visitDate) > new Date())) && (event.__t === tourType)
  );

  return (
    <div className="events-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h1>Assigned Future Events</h1>

        <button
          style={{ width: "auto" }}
          onClick={() => {
            setShowPastEvents((prev) => !prev);
          }}
        >
          {showPastEvents ? "Show Future Events" : "Show Past Events"}
        </button>
      </div>
      <TypeSelectionTrio showType={tourType} setShowType={setTourType} haveFairButton= {false}/>
      {message && <p>{message}</p>}

      <GeneralTable
        showFairs={false}
        showTours={true}
        events={filteredEvents}
        filter={tourType}
        setMessage={setMessage}
        statusFilter="all"
        searchTerm=""
        user={user}
        showType={tourType}
        setIsLoading={setIsLoading}
        EventRowActions={({ event, user, setMessage }) => {
          return (
            <AssignedEventsActions
              event={event}
              user={user}
              setMessage={setMessage}
              handleCompleteEvent={handleCompleteEvent}
              handleCancelEvent={handleMarkCanceled}
              handleTakeBackAction={handleTakeBack}
            />
          );
        }}
        showExtraProperties={{
          SchoolTour: ["contactPerson", "assignedAdvisor"],
          IndividualTour: [ "studentHighSchool", "majorOfInterest"],
        }}
      />
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default AssignedEvents;
