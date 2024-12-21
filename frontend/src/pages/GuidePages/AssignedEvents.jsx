import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/GuidePages/Events.css";
import { FaBackward } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import GeneralTable from "../../components/GeneralTable";
import AssignedEventsActions from "../../components/AssignedEventsActions";
import TypeSelectionTrio from "../../components/TypeSelectionTrio";
import DetailsModal from '../../components/DetailsModal';


const AssignedEvents = () => {
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [tourType, setTourType] = useState("SchoolTour");
  const [actionInProcess, setActionInProcess] = useState(false);
  const [showWorkLog, setShowWorkLog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAssignedEvents(token);
      fetchUserProfile(token);
    }
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (showWorkLog && token) {
      setShowPastEvents(true);
      fetchCompletedEvents(token);
    }
    if (!showWorkLog && token) {
      setShowPastEvents(false);
      fetchAssignedEvents(token);
      
    }
   
  }, [showWorkLog]);
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
  const fetchCompletedEvents = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/events/user?completed=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        
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
  const fetchAssignedEvents = async (token) => {
    try {
      let events = [];
      
      // Fetch tours
      const eventsResponse = await fetch("http://localhost:3000/api/events/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        events = eventsData;
      }

      // Fetch fairs
      const fairsResponse = await fetch("http://localhost:3000/api/fairs/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (fairsResponse.ok) {
        const fairsData = await fairsResponse.json();
        // Add __t property to fairs to match tour structure
        const formattedFairs = fairsData.map(fair => ({
          ...fair,
          __t: "Fair",
          visitDate: fair.fairDate, // normalize date field
          status: fair.status || "accepted"
        }));
        events = [...events, ...formattedFairs];
      }

      setAssignedEvents(events);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
    }
  };

  const handleCompleteEvent = async (eventId, workHours) => {
    setActionInProcess(true);

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
                ? { ...event, status: "completed-verified" , hoursOfWork: workHours}
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
      setActionInProcess(false);
  };
  const handleMarkCanceled = async (eventId) => {
    const token = localStorage.getItem("token");
    setActionInProcess(true);
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
                ? { ...event, status: "canceled-verified" , hoursOfWork: 0}
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
    setActionInProcess(false);
  };
  const handleTakeBack = async (eventId, eventType) => {
    setActionInProcess(true);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const endpoint = eventType === "Fair"
          ? `http://localhost:3000/api/fairs/${eventId}/take-back`
          : `http://localhost:3000/api/events/${eventId}/take-back`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setAssignedEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === eventId ? { ...event, status: "accepted", hoursOfWork: 0 } : event
            )
          );
          setMessage("✅ Event status reset successfully");
        } else {
          const error = await response.json();
          setMessage(`⚠️ ${error.message || "Failed to reset event status"}`);
        }
      } catch (error) {
        console.error("Error resetting event status:", error);
        setMessage("⚠️ Error resetting event status");
      }
    }
    setActionInProcess(false);
  };
  const filteredEvents = assignedEvents.filter((event) => {
    const eventDate = event.visitDate || event.fairDate;
    const isPastEvent = new Date(eventDate) < new Date();
    const isFutureEvent = new Date(eventDate) > new Date();
    
    if (!eventDate) return false;

    const matchesTourType = 
      (tourType === "Fair" && event.__t === "Fair") ||
      (tourType !== "Fair" && event.__t === tourType);

    return (
      ((showPastEvents || showWorkLog) && isPastEvent) ||
      (!showPastEvents && isFutureEvent)
    ) && matchesTourType;
  });
  const setExtraProperties = () => {
    if (showPastEvents && !showWorkLog){
      return {
        SchoolTour: ["contactPerson", "assignedAdvisor"],
        IndividualTour: [ "studentHighSchool", "majorOfInterest"],
      };
    }
    else if (showWorkLog){
      return {
        SchoolTour: ["contactPerson", "assignedAdvisor", "hoursOfWork"],
        IndividualTour: [ "studentHighSchool", "majorOfInterest", "hoursOfWork"],
      };
    }
    else{
      return {
        SchoolTour: ["contactPerson", "assignedAdvisor"],
        IndividualTour: [ "studentHighSchool", "majorOfInterest"],
      };
    }
  }
  const extraProperties = setExtraProperties();
  const handleShowDetails = (event) => {
    setSelectedEvent(event);
  };
  const handleCloseModal = () => {
    setSelectedEvent(null);
  };
  const handleComplete = async (event) => {
    console.log("Event data received:", event); // Debug log

    if (!event || !event._id) {
      console.log("Invalid event data:", { event }); // Debug what's invalid
      setMessage("⚠️ Invalid event data");
      return;
    }

    setActionInProcess(true);
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        const endpoint = event.__t === "Fair" 
          ? `http://localhost:3000/api/fairs/${event._id}/complete`
          : `http://localhost:3000/api/events/${event._id}/complete`;

        console.log("Completing event:", { endpoint, event }); // Debug log

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            workHours: event.hoursOfWork || 3, // Default to 3 hours if not specified
            fairId: event._id, // Add for fairs
            eventId: event._id // Add for events
          }),
        });

        if (response.ok) {
          setAssignedEvents((prevEvents) =>
            prevEvents.map((e) =>
              e._id === event._id ? { ...e, status: "completed-verified" } : e
            )
          );
          setMessage("✅ Event marked as completed successfully");
        } else {
          const errorData = await response.json();
          setMessage(`⚠️ ${errorData.message || "Failed to complete event"}`);
        }
      } catch (error) {
        console.error("Error completing event:", error);
        setMessage("⚠️ Error completing event");
      }
    }
    setActionInProcess(false);
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
        <h1>Assigned Future Events</h1>

        { !showWorkLog && (<button
          style={{ width: "auto" }}
          onClick={() => {
            setShowPastEvents((prev) => !prev);
          }}
        >
          {showPastEvents ? "Show Future Events" : "Show Past Events"}
        </button>)} 
        {  (
          <button
            style={{ width: "auto" }}
            onClick={() => {
              setShowWorkLog((prev)=>!prev);
            }}
          >
           {showWorkLog && <FaBackward/>} {showWorkLog ? "Go Back" : "Show Work Log"}
          </button>
        )}
      </div>
      <TypeSelectionTrio showType={tourType} setShowType={setTourType} haveFairButton= {true}/>
      {message && <p>{message}</p>}

      {!isLoading &&<GeneralTable
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
              handleCompleteEvent={handleComplete}
              handleCancelEvent={handleMarkCanceled}
              handleTakeBackAction={(eventId) => handleTakeBack(eventId, event.__t)}
              actionInProcess={actionInProcess}
              setActionInProcess={setActionInProcess}
            />
          );
        }}
        showExtraProperties={extraProperties}
        onShowDetails={handleShowDetails}
      />}
      {selectedEvent && (
        <DetailsModal
          application={selectedEvent}
          onClose={handleCloseModal}
          context="events"
          user={user}
        />
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default AssignedEvents;
