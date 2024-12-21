import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/AdvisorPages/ManageGuides.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import GuideFinder from "../../components/GuideFinder";
import TypeSelectionTrio from "../../components/TypeSelectionTrio";

const ManageGuides = () => {
  const [events, setEvents] = useState([]);
  const [guides, setGuides] = useState([]);
  const [updatedAssignments, setUpdatedAssignments] = useState({});
  const [updatedRemovals, setUpdatedRemovals] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showGuideFinder, setShowGuideFinder] = useState(false);
  const [selectedEventOrFair, setSelectedEventOrFair] = useState(null);
  const [tourType, setTourType] = useState("SchoolTour");

  const token = localStorage.getItem("token");
  const personIconUrl =
  "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
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
        const guides = eventsData.map((event) => event.appliedUsers);
        setGuides(guides);  
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
 
  const clearChoices = () => {
    setUpdatedAssignments({});
    setUpdatedRemovals({});

  }
  const checkIfGuideHasBeenAssigned = (event, guide) => {
    return event.assignedUsers.some((assignedGuide) => assignedGuide._id === guide._id);
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
        clearChoices();
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

  const openGuideFinder = (eventOrFair) => {
    setSelectedEventOrFair(eventOrFair);
    setShowGuideFinder(true);
  };

  const closeGuideFinder = () => {
    setShowGuideFinder(false);
    setSelectedEventOrFair(null);
  };

  const filteredEvents = events.filter(event => event.__t === tourType);

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
        <button onClick={() => navigate("/completed-tours")} style={{ padding: "10px 20px" , width :"auto" }}>
          View Completed Tours
        </button>
        <button onClick={() => navigate("/trainees")} style={{ padding: "10px 20px" , width :"auto" }}>
          View Trainees
        </button>
      </div>
      {message && <p>{message}</p>}
      {showGuideFinder && (
        <GuideFinder eventOrFair={selectedEventOrFair} onClose={closeGuideFinder} assignGuide={assignGuide} unassignGuide={unassignGuide}  />
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>High School/Applicant</th>
            <th>City</th>
            <th>Date</th>
            <th>Time</th>
            <th>Number of Visitors/Details</th>
            <th>Assigned Guides</th>
            <th>Assign New Guide</th>
            <th>Remove Guide</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.length>0 ? (filteredEvents.map((event, index) => (
            <tr key={event._id}>
              <td>{index + 1}</td>
              <td>{event.applicant.name}</td>
              <td>{event.city}</td>
              <td>{new Date(event.visitDate).toLocaleDateString()}</td>
              <td>{event.visitTime}</td>
              <td>{event.studentCount || event.details || "N/A"}</td>
              <td>
                {event.assignedUsers.map((guide) => (
                  <div key={guide._id} style={{display : "flex", alignItems : "center",gap : "5px"}}>
                    <img
                        src={personIconUrl}
                        alt={guide.name}
                        title={guide.name}
                        style={{ width: "20px", height: "20px",cursor: "pointer" }}
                      />
                    {guide.name}</div>
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
                  {guides[index].map((guide) => (
                    checkIfGuideHasBeenAssigned(event,guide) ? null :
                    <option key={guide._id} value={guide._id}>
                      {guide.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  onChange={(e) =>
                    setUpdatedRemovals((prev) => 
                      ({
                      
                      ...prev,
                      [event._id]: e.target.value,
                    }))
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Guide
                  </option>
                  {event.assignedUsers.map((guide) => 
                    (
                    <option key={guide._id} value={guide._id}>
                      {guide.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                 <button onClick={() => handleEditClick(event)} className="edit-details-button">
                     Edit Details
                 </button>
                <button onClick={() => saveChanges(event._id)} className="save-changes-button">
                    Save Changes
                </button>
                <button onClick={() => openGuideFinder(event)} className="find-guide-button">
                    Find Guide
                </button>
              </td>
            </tr>
          ))):( isLoading ? (
          <tr>
            <td colSpan="100" style={{ textAlign: "center",  background : "none"}}>
            <LoadingSpinner
            loading="Guides & Events" />
            </td>
          </tr>
          ):(
            <tr>
              <td colSpan="100" style={{ textAlign: "center" }}>
                No tours found.
              </td>
            </tr>)
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageGuides;
