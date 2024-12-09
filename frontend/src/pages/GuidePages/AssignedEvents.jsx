import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import '../../styles/GuidePages/Events.css'
import PastEvents from "./PastEvents";
import LoadingSpinner from "../../components/LoadingSpinner";
const AssignedEvents = () => {  
  
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPastEvents, setShowPastEvents] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAssignedEvents(token);
    }
  }, []);

  
  const fetchAssignedEvents = async (token) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/events/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const currentDate = new Date();
        const futureEvents = data.filter(event => new Date(event.visitDate) > currentDate);
        setAssignedEvents(futureEvents);
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
  if (showPastEvents===true) return <div> <PastEvents setShowPastEvents={setShowPastEvents} /></div>;

  return (
    <div className="events-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h1>Assigned Future Events</h1>
        
        <button style={{ width: "auto" }} onClick={()=>setShowPastEvents(true)}>
          View Past Events
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
            </tr>
          </thead>
          <tbody>
          {assignedEvents.length > 0 ? (
          
 
            assignedEvents.map((event) => (
              <tr key={event._id}>
                <td>{event.applicant.name || "N/A"}</td>
                <td>{new Date(event.visitDate).toLocaleDateString()}</td>
                <td>{new Date(event.visitDate).toLocaleTimeString()}</td>

                <td>{event.status}</td>
              </tr>
            ))
         
          ) :( isLoading ? (
          <tr>
            <td colSpan="100" style={{ textAlign: "center",  background : "none"}}>
            <LoadingSpinner
            loading="Assigned Events" />
            </td>
          </tr>
          ):(
            <tr>
              <td colSpan="100" style={{ textAlign: "center" }}>
                No events assigned yet.
              </td>
            </tr>)
          )}
          </tbody>
        </table>
      
    </div>
  );
};

export default AssignedEvents;
