import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("visitDate");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
      <h1>Events</h1>

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
        <table className="events-table">
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
              <tr key={event._id}>
                <td>{event.name}</td>
                <td>{event.__t.replace(/([a-z])([A-Z])/g, "$1 $2")}</td>
                <td>{new Date(event.visitDate).toLocaleDateString()}</td>
                <td>{event.requiredNumberOfGuides}</td>
                <td>{event.status}</td>
                <td>
                  <Link to={`/events/${event._id}`} className="view-details">
                    View Details
                  </Link>
                </td>
              </tr>
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
