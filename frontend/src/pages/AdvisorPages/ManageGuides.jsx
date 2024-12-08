import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdvisorPages/ManageGuides.css";

const ManageGuides = () => {
  const [events, setEvents] = useState([]);
  const [guides, setGuides] = useState([]);
  const [updatedAssignments, setUpdatedAssignments] = useState({});
  const [updatedRemovals, setUpdatedRemovals] = useState({});
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const personIconUrl =
  "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchGuides();
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
        
        //setGuides(data);
      } else {
        setMessage("Failed to fetch guides.");
      }
    } catch (error) {
      setMessage("Error fetching guides: " + error.message);
    }
  };
  const cleaChoices = () => {
    setUpdatedAssignments({});
    setUpdatedRemovals({});

  }
  const checkIfGuideHasBeenAssigned = (event, guide) => {
    return event.assignedUsers.some((assignedGuide) => assignedGuide._id === guide._id);
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
        cleaChoices();
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Event Guide Management</h1>
        <button onClick={() => navigate("/completed-tours")} style={{ padding: "10px 20px" , width :"auto" }}>
          View Completed Tours
        </button>
      </div>
      {message && <p>{message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>High School/Applicant</th>
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
              <td>{event.applicant.name}</td>
              <td>{event.city}</td>
              <td>{new Date(event.visitDate).toLocaleDateString()}</td>
              <td>{event.visitTime}</td>
              <th>{event.studentCount}</th>
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
