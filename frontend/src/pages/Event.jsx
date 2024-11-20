import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/Event.css";
import "../styles/TourApplication.css";

const Event = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const fetchEvent = async (token) => {
      try {
        const response = await fetch(`http://localhost:3000/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const data = await response.json();

        setEvent(data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchEvent(token); // Fetch events if logged in
    }
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="event-container">
      <h1>{event.name}</h1>
      <p>Date: {new Date(event.visitDate).toLocaleDateString()}</p>
      <p>Required Number Of Guides: {event.reqiredNumberOfGuides}</p>
      <p>Status :  {event.status}</p>
      <p>Application Date: {new Date(event.applicationDate).toLocaleDateString()}</p>
      <p>Application Type: {event.__t.replace(/([a-z])([A-Z])/g, '$1 $2')}</p>
      <p>Additional Notes : {event.additionalNotes}</p>
       {event.__t === "IndividualTour"  &&<p>School: {event.studentHighSchool}</p>}
       {event.__t === "SchoolTour"  &&<p>High School: {event.schoolName}</p>}
    </div>
  );
};

export default Event;