import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../../styles/GuidePages/Events.css';
import '../../styles/components/LoadingSpinner.css';
import EventRow from "../../components/EventRow";
import FairRow from "../../components/FairRow";
import LoadingSpinner from "../../components/LoadingSpinner";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [sortOption, setSortOption] = useState("visitDate");
  const [filterType, setFilterType] = useState(""); // Filter for tour type
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("tours"); // "tours" or "fairs"

  // Fetch events or fairs when `viewType` changes
  useEffect(() => {
    if (viewType === "fairs") {
      fetchAcceptedFairs();
    } else {
      fetchAcceptedEvents();
    }
  }, [viewType]);

  const fetchAcceptedFairs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/api/fairs/accepted-fairs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch fairs");
      }
      const data = await response.json();
      setEvents(data); // Reuse events state for fairs
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const applyToFair = async (fairId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3000/api/fairs/apply`, {
        method: "POST",
        headers: {
          userrole: user.role,
          userid: user._id,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fairID: fairId }),
      });

      if (response.ok) {
        setMessage("Applied to Fair successfully.");
        window.location.reload();
        setEvents((prevEvents) =>
          prevEvents.map((fair) =>
            fair._id === fairId ? { ...fair, isAssigned: true } : fair
          )
        );
      } else {
        const errorData = await response.json();
        setMessage(`Failed to apply: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };




  const fetchAcceptedEvents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
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

  const applyToEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/events/apply`,
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
        setMessage(`Applied To Event successfully.`);
        window.location.reload();
      } else {
        setMessage(`Failed to apply.`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

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

  const removeAssignedFair = async (fairId) => {
    try {
      const token = localStorage.getItem("token");

      console.log("Token:", token); // Debug: Log token
      console.log("User ID:", user?._id); // Debug: Log user ID
      console.log("Fair ID:", fairId); // Debug: Log fair ID being removed

      if (!token) {
        setMessage("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/fairs/${fairId}/remove-guide`,
        {
          method: "POST", // Ensure method matches backend expectations
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Proper Bearer token header
          },
          body: JSON.stringify({ userID: user._id }), // Sending user ID in body
        }
      );

    const data = await response.json();
    console.log("Backend response:", data);

      if (response.ok) {
        // Successfully removed
        setMessage("Removed from Fair successfully.");
        window.location.reload(); // Optional: Reloads the page to reflect changes
      } else {
        // Handle backend error messages
        const errorData = await response.json();
        setMessage(
          `Failed to remove from fair: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      // Handle network or other errors
      setMessage(`An error occurred: ${error.message}`);
    }
  };


  const sortEvents = (events, option) => {
    return [...events].sort((a, b) => {
      if (option === "name") {
        const nameA = (a.applicant?.name || "").toLowerCase();
        const nameB = (b.applicant?.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (option === "visitDate") {
        return new Date(a.visitDate) - new Date(b.visitDate);
      } else if (option === "requiredGuides") {
        return b.requiredNumberOfGuides - a.requiredNumberOfGuides;
      }
      return 0;
    });
  };

  const filteredEvents = events.filter((event) => {
    const matchesType = filterType ? event.__t === filterType : true;
    const matchesSearch =
      searchTerm.trim() === "" ||
      (event.applicant?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.city || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  const sortedEvents = sortEvents(filteredEvents, sortOption);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Error Loading Events</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Confirmed Events</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search search-icon"></i>
        </div>
      </div>

      {message && <div className="alert-message">{message}</div>}

      <div className="controls-container">
        <div>
          <button
            onClick={() => {
              setFilterType("SchoolTour");
              setViewType("tours");
            }}
            style={{
              padding: "5px 30px",
              width: "auto",
              backgroundColor: filterType === "SchoolTour" ? "#ddd" : "",
            }}
          >
            School Tours
          </button>
          <button
            onClick={() => {
              setFilterType("IndividualTour");
              setViewType("tours");
            }}
            style={{
              marginRight: "10px",
              marginLeft: "10px",
              padding: "5px 30px",
              width: "auto",
              backgroundColor: filterType === "IndividualTour" ? "#ddd" : "",
            }}
          >
            Individual Tours
          </button>
          <button
            onClick={() => {
              setFilterType("");
              setViewType("fairs");
            }}
            style={{
              marginLeft: "10px",
              padding: "5px 30px",
              backgroundColor: viewType === "fairs" ? "#ddd" : "",
            }}
          >
            Fairs
          </button>
        </div>
        <div className="filter-sort-controls">
          <div className="control-group">
            <label htmlFor="sortOption">
              <i className="fas fa-sort"></i> Sort
            </label>
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
      </div>

      <div className="table-container">
        {isLoading ? (
          <LoadingSpinner loading={viewType === "fairs" ? "Fairs" : "Events"} />
        ) : sortedEvents.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>{viewType === "fairs" ? "Fair Name" : "Name"}</th>
                <th>Type</th>
                <th>Date</th>
                <th>Current Guides</th>
                <th>Required Guides</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {viewType === "fairs"
                ? sortedEvents.map((fair) => (
                    <FairRow
                      key={fair._id}
                      fair={fair}
                      user={user}
                      applyToFair={applyToFair}
                      removeAssignedFair={removeAssignedFair}
                    />
                  ))
                : sortedEvents.map((event) => (
                    <EventRow
                      key={event._id}
                      event={event}
                      user={user}
                      addToAssignedEvents={applyToEvent}
                      removeAssignedEvent={removeAssignedEvent}
                    />
                  ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <p>No events found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
