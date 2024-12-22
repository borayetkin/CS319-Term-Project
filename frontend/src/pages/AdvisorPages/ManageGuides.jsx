import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdvisorPages/ManageGuides.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import GuideFinder from "../../components/GuideFinder";
import TypeSelectionTrio from "../../components/TypeSelectionTrio";
import GeneralTable from "../../components/GeneralTable";

const ManageGuides = () => {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showGuideFinder, setShowGuideFinder] = useState(false);
  const [selectedEventOrFair, setSelectedEventOrFair] = useState(null);
  const [tourType, setTourType] = useState("SchoolTour");
  const [showPastEvents, setShowPastEvents] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/events?accepted=true&advisor=true", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setMessage("Failed to fetch events.");
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Error fetching events: " + error.message);
    }
  };

  const handleEditClick = (event) => {
    navigate(`/edit/${event._id}`);
  };

  const assignGuide = async (eventId, guideId) => {
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
      const data = await response.json();
      if (response.ok) {
        setMessage("Guide assigned successfully.");
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId
              ? { ...event, assignedUsers: [...event.assignedUsers, data.assignedGuide] }
              : event
          )
        );
      } else {
        setMessage("Failed to assign guide: " + data.message);
      }
    } catch (error) {
      setMessage("Error assigning guide: " + error.message);
    }
  };

  const unassignGuide = async (eventId, guideId) => {
    try {
      const response = await fetch("http://localhost:3000/api/events/remove-guide", {
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
      const data = await response.json();
      if (response.ok) {
        setMessage("Guide unassigned successfully.");
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId
              ? { ...event, assignedUsers: event.assignedUsers.filter((guide) => guide._id !== guideId) }
              : event
          )
        );
      } else {
        setMessage("Failed to unassign guide: " + data.message);
      }
    } catch (error) {
      setMessage("Error unassigning guide: " + error.message);
    }
  };

  const openGuideFinder = (eventOrFair) => {
    setSelectedEventOrFair(eventOrFair);
    setShowGuideFinder(true);
  };

  const closeGuideFinder = () => {
    console.log("close guide finder");
    
    setShowGuideFinder(false);
    setSelectedEventOrFair(null);
  };

  const toggleShowPastEvents = () => {
    setShowPastEvents((prevShowPastEvents) => !prevShowPastEvents);
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.visitDate);
    return event.__t === tourType && (showPastEvents ? eventDate < new Date() : eventDate >= new Date());
  });

  const EventRowActions = ({ event }) => {
    const eventDate = new Date(event.visitDate);
    const isEventPast = eventDate < new Date();
    return !isEventPast &&
    <div>
      <button onClick={() => handleEditClick(event)} className="edit-details-button">
        Edit Details
      </button>
      <button onClick={() => openGuideFinder(event)} className="find-guide-button">
        Find Guide
      </button>
    </div>
  };

  const extraProperties = {
    SchoolTour: ["assignedUsers", "requiredNumberOfGuides"],
    IndividualTour: ["majorOfInterest"],
  };

  return (
    <div style={{ padding: "20px" }} className="manage-guides-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Event Guide Management</h1>
        <TypeSelectionTrio
          setShowType={setTourType}
          showType={tourType}
          haveFairButton={false}
          upperCase={false}
        />
        <button onClick={toggleShowPastEvents} style={{ padding: "10px 20px", width: "auto" }}>
          {showPastEvents ? "View Upcoming Tours" : "View Completed Tours"}
        </button>
        <button onClick={() => navigate("/trainees")} style={{ padding: "10px 20px", width: "auto" }}>
          View Trainees
        </button>
      </div>
      {message && <p>{message}</p>}
      {showGuideFinder && (
        <GuideFinder eventOrFair={selectedEventOrFair} onClose={closeGuideFinder} assignGuide={assignGuide} unassignGuide={unassignGuide} />
      )}
      {!isLoading && (
        <GeneralTable
          showFairs={false}
          showTours={true}
          events={filteredEvents}
          setMessage={setMessage}
          user={null}
          showType={tourType}
          viewType="events"
          EventRowActions={EventRowActions}
          showExtraProperties={extraProperties}
        />
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default ManageGuides;
