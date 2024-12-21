import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../../styles/GuidePages/Events.css';
import '../../styles/components/LoadingSpinner.css';

import LoadingSpinner from "../../components/LoadingSpinner";
import EventRowActions from "../../components/EventRowActions";
import FairRowActions from "../../components/FairRowActions";
import GeneralTable from "../../components/GeneralTable";
import TypeSelectionTrio from "../../components/TypeSelectionTrio";
import DetailsModal from "../../components/DetailsModal";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [messageTimeout, setMessageTimeout] = useState(null);
  const [sortOption, setSortOption] = useState("visitDate");
  const [showType, setShowType] = useState("SchoolTour"); // Filter for tour type
  const [user, setUser] = useState(null);
  const [fairs, setFairs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("tours"); // "tours" or "fairs"
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch events or fairs when `viewType` changes
  useEffect(() => {
    if (viewType === "fairs") {
      fetchAcceptedFairs();
    } else {
      fetchAcceptedEvents();
    }
    setError(null);
    setMessage("");
  }, [viewType]);
  useEffect(() => {
    if(showType === "Fair") {
      setViewType("fairs");
    } else {
      setViewType("tours");
    }
  }, [showType]);
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
      setFairs(data); // Reuse events state for fairs
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
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
  const sortFairs = (fairs, option) => {
    return [...fairs].sort((a, b) => {
      if (option === "name") {
        const nameA = (a.organiserName || "").toLowerCase();
        const nameB = (b.organiserName || "").toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (option === "visitDate") {
        return new Date(a.fairDate) - new Date(b.fairDate);
      } else if (option === "requiredGuides") {
        return b.requiredNumberOfGuides - a.requiredNumberOfGuides;
      }
      return 0;
    });
  }
  const sortedFairs = sortFairs(fairs, sortOption);
  const filteredEvents = events.filter((event) => {
    const matchesType = showType ? event.__t === showType : true;
    const isPast = new Date(event.visitDate) < new Date();
    const matchesSearch =
      searchTerm.trim() === "" ||
      (event.applicant?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.city || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch && !isPast;
  });

  const sortedEvents = sortEvents(filteredEvents, sortOption);

  const handleShowDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  // Add message handling effect
  useEffect(() => {
    if (message) {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      const timeout = setTimeout(() => {
        setMessage("");
      }, 3000);
      setMessageTimeout(timeout);
    }
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [message]);

  // Fix the handleActionComplete function
  const handleActionComplete = async () => {
    await fetchAcceptedEvents();
  };

  const handleEventsUpdate = (updatedEvents) => {
    setEvents(updatedEvents);
  };

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
        <Link to="/advisor-info" className="advisor-info-link">View Advisors</Link>
      </div>

      {message && (
        <div className={`message-popup ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="controls-container">
        <TypeSelectionTrio
          setShowType={setShowType}
          haveFairButton={true}
          haveSchoolTourButton={true}
          haveIndividualTourButton={true}
          showType={showType}
        />
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

     
        {isLoading ? (
          <LoadingSpinner loading={viewType === "fairs" ? "Fairs" : "Events"} />
        ) : (
          <>
            <GeneralTable
              showFairs={true}
              showTours={true}
              showExtraProperties={{
                SchoolTour: ["assignedUsers","requiredNumberOfGuides","contactPerson","email"],
                IndividualTour: ["studentHighSchool","email","phoneNumber" ],
                Fair: ["assignedUsers","requiredNumberOfGuides","organiserName","email","city"],
              }}
              setMessage={setMessage}
              user={user}
              fairs={sortedFairs}
              events={sortedEvents}
              showType={showType}
              searchTerm={searchTerm}
              EventRowActions={(props) => (
                <EventRowActions
                  {...props}
                  setMessage={setMessage}
                  events={sortedEvents}
                  setEvents={handleEventsUpdate}
                  onActionComplete={handleActionComplete}
                />
              )}
              FairRowActions={(props) => (
                <FairRowActions
                  {...props}
                  setMessage={setMessage}
                  onActionComplete={handleActionComplete}
                  setFairs = {setFairs}
                />
              )}
              viewType={viewType}
              onShowDetails={handleShowDetails}
            />

            {showDetailsModal && (
              <DetailsModal
                application={selectedItem}
                onClose={() => setShowDetailsModal(false)}
                context="events"
              />
            )}
          </>
        )}
      </div>
   
  );
};

export default Events;
