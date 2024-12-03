import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/Event.css";
import "../styles/TourApplication.css";

const Event = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState(null);
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

        const eventData = await response.json();
        const assigneesRes = await fetch(
          `http://localhost:3000/api/events/${id}/assignees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const assignees = await assigneesRes.json();

        setAssignedUsers(assignees);
        setEvent(eventData);
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
      <p>
        Date and Time: {new Date(event.visitDate).toLocaleDateString()}{" "}
        {event.visitTime}
      </p>
      <p>Required Number Of Guides: {event.requiredNumberOfGuides}</p>
      <p>Status : {event.status}</p>
      <p>
        Application Date: {new Date(event.applicationDate).toLocaleDateString()}
      </p>
      <p>Application Type: {event.__t.replace(/([a-z])([A-Z])/g, "$1 $2")}</p>
      <p>Additional Notes : {event.additionalNotes || "N/A"}</p>
      {event.__t === "IndividualTour" && (
        <>
          <p>Student Name: {event.contactPerson}</p>
          <p>Email: {event.email}</p>
          <p>Phone Number: {event.phoneNumber}</p>
          <p>City: {event.city}</p>
          <p>Major of Interest: {event.majorOfInterest}</p>
          <p>High School: {event.studentHighSchool}</p>
        </>
      )}
      {event.__t === "SchoolTour" && (
        <>
          <p>Contact Person: {event.contactPerson}</p>
          <p>Email: {event.email}</p>
          <p>Phone Number: {event.phoneNumber}</p>
          <p>City: {event.city}</p>
          <p>High School: {event.schoolName}</p>
          <p>Number of Students: {event.studentCount}</p>
        </>
      )}
      {event.__t && <p>Advisor: {event.assignedAdvisor.name}</p>}
      {event.__t === "SchoolTour" &&
        assignedUsers &&
        assignedUsers.map((user, index) => (
          <p key={index}>Assigned Guide: {user.name}</p>
        ))}
    </div>
  );
};

export default Event;
