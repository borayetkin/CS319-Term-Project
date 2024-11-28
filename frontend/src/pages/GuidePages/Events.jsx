import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../../styles/GuidePages/Events.css'
import EventRow from "../../components/EventRow";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const [sortOption, setSortOption] = useState("visitDate");
  const [filterType, setFilterType] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchAcceptedEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/events/accepted", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        fetchUserProfile(token);
        setEvents(data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    
    const token = localStorage.getItem("token");
    if (token) {
      fetchAcceptedEvents(token); // Fetch events if logged in
    } else {
      setError("Authorization Denied");
    }


  }, []);


  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);


      } else {
        setMessage("Failed to fetch user profile");
      }
    } catch (error) {
      setMessage("Error fetching user profile: " + error.message);
    }
  };
  const addToAssignedEvents = async(eventId) =>{
    try {
      const token = localStorage.getItem("token");

      
      const response = await fetch(
        `http://localhost:3000/api/events/assign-guide`,
        {
          method: "POST",
          headers: {
            userrole: user.role,
            userid : user._id,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventID : eventId, userID : user._id }),
        }
      );
      if (response.ok) {
        setMessage(`Assigned To Event successfully.`);
        window.location.reload();
      } else {
        setMessage(`Failed to assign application.`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  }
  const removeAssignedEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/events/remove-guide`,
        {
          method: "POST",
          headers: {
            userrole: user.role,
            userid: user._id,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventID: eventId, userID: user._id }),
        }
      );
      if (response.ok) {
        setMessage(`Removed from Event successfully.`);
        window.location.reload();
      } else {
        setMessage(`Failed to remove from event.`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };
  const sortEvents = (events, option) => {
    return [...events].sort((a, b) => {
      if (option === "name") {
        return a.name.localeCompare(b.name);
      } else if (option === "visitDate") {
        return new Date(a.visitDate) - new Date(b.visitDate);
      } else if (option === "requiredGuides") {
        return b.requiredNumberOfGuides - a.requiredNumberOfGuides;
      }
      return 0;
    });
  };

  const filteredEvents = events.filter((event) =>
    filterType ? event.__t === filterType : true

  );

  const sortedEvents = sortEvents(filteredEvents, sortOption);

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="events-container">
      <h1>CONFIRMED EVENTS</h1>
    {message && <div>{message}</div>}
      <div className="filter-sort-controls">
        <div className="filter-controls">
          <label htmlFor="filterType">Filter by type:</label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All</option>
            <option value="IndividualTour">Individual Tour</option>
            <option value="SchoolTour">School Tour</option>
          </select>
        </div>

        <div className="sort-controls">
          <label htmlFor="sortOption">Sort by:</label>
          <select
            id="sortOption"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="visitDate">Visit Date</option>
            <option value="name">Name</option>
            <option value="requiredGuides">Required Guides</option>
          </select>
        </div>
      </div>

      {sortedEvents.length > 0 ? (
        <table className="">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Required Guides</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((event) => (
              <EventRow
              key={event._id}
              event={event}
              user={user}
              addToAssignedEvents={addToAssignedEvents}
              removeAssignedEvent={removeAssignedEvent}
            />
            ))}
          </tbody>
        </table>
      ) : (
        <p>No events found.</p>
      )}
    </div>
  );
};

export default Events;
