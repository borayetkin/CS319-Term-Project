// Applications.jsx - Part 1
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdvisorPages/Applications.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import GeneralTable from "../../components/GeneralTable";
import ApplicationsRowActions from "../../components/ApplicationsRowActions";
import TypeSelectionTrio from "../../components/TypeSelectionTrio";
import { FaSearch } from 'react-icons/fa';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);
  const [tourType, setTourType] = useState("SchoolTour");
  const [sortOption, setSortOption] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showWeeklySchedules, setShowWeeklySchedules] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState({});
  const [popup, setPopup] = useState({ show: false, slot: null, schoolNames: [], loadingItem: null, });
  const [slotInformation, setSlotInformation] = useState([]);
  const [isLoadingWeeklySchedules, setIsLoadingWeeklySchedules] = useState(false);
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
      fetchWeeklySchedules(token);
      
    }
  }, []);
  useEffect ( () => {
    if (weeklySchedules && weeklySchedules.length > 0) {
      fetchAllPossibleSlots(weeklySchedules[currentWeekIndex]?.weekBeginning);
      
    }
  }, [weeklySchedules, currentWeekIndex]);
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        fetchApplications(token, data);
      } else {
        setIsLoading(false);
        setMessage("Failed to fetch user profile");
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Error fetching user profile: " + error.message);
    }
  };

  const fetchApplications = async (token, us) => {
    try {
      const url =
        us.role === "advisor"
          ? "http://localhost:3000/api/events/advisor"
          : "http://localhost:3000/api/events/";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
        setIsLoading(false);
      } else {
        setMessage("Failed to fetch applications");
      }
    } catch (error) {
      setMessage("Error fetching applications: " + error.message);
    }
  };

  const fetchWeeklySchedules = async (token) => {
    setIsLoadingWeeklySchedules(true);
    try {
      const response = await fetch("http://localhost:3000/api/schedules/load", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWeeklySchedules(data);

      } else {
        setMessage("Failed to fetch weekly schedules");
      }
    } catch (error) {
      setMessage("Error fetching weekly schedules: " + error.message);
    }
    setIsLoadingWeeklySchedules(false);
  };
  const fetchAllPossibleSlots = async (weekBeginning) => {
    try {

      const response = await fetch(
        `http://localhost:3000/api/schedules/week-all?weekBeginning=${weekBeginning}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSlotInformation(data);
      } else {
        setMessage("Failed to fetch all possible slots");
      }
    } catch (error) {
      setMessage("Error fetching all possible slots: " + error.message);
    }
  }
  const handleRebuildSchedules = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/schedules/rebuild",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWeeklySchedules(data);
        alert("Schedules rebuilt successfully!");
      } else {
        alert("Failed to rebuild schedules.");
      }
    } catch (error) {
      alert("Error rebuilding schedules: " + error.message);
    }
  };

  const handleRemoveEvent = async (slot) => {
    try {
      const eventId = slot.event._id;
      slot.event = null;
      slot.isEmpty = true;
  
      setLoadingSlots((prev) => ({ ...prev, [slot.slotDay + slot.slotTime]: true }));
  
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/schedules/remove-from-schedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify( { eventId } ), // Send only the eventId
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error removing event: ${errorData.message}`);
        return;
      }
  
    } catch (error) {
      setMessage("Error removing event: " + error.message);
    } finally {
      setLoadingSlots((prev) => ({ ...prev, [slot.slotDay + slot.slotTime]: false }));
    }
  };
  

  const handleAddEvent = async (weekBeginning, slotDay, slotTime) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/schedules/matching-slot",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ weekBeginning, slotDay, slotTime }),
        }
      );
    
      const schoolNames = await response.json();
      return schoolNames;
      
    } catch (error) {
      setMessage("Error fetching matching events: " + error.message);
      return [];
    }
  };

  const handlePopupSelections = async (schoolName, slot) => {
    try {
      setPopup((prev) => ({ ...prev, loadingItem: schoolName }));
      const token = localStorage.getItem("token");
      setLoadingSlots((prev) => ({ ...prev, [slot.slotDay + slot.slotTime]: true }));
      await fetch("http://localhost:3000/api/schedules/assign-to-slot", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolName,
          weekBeginning: weeklySchedules[currentWeekIndex]?.weekBeginning,
          slotDay: slot.slotDay,
          slotTime: slot.slotTime,
        }),
      });
      await fetchWeeklySchedules(token);
    } catch (error) {
      setMessage("Error assigning event: " + error.message);
    } finally {
      setPopup({ show: false, slot: null, schoolNames: [], loadingItem: null });
      setLoadingSlots((prev) => ({ ...prev, [slot.slotDay + slot.slotTime]: false }));
    }
  };


  const sortApplications = (applications) => {
    const sortedApplications = [...applications];
    if (sortOption === "default") {
      return applications.sort((a, b) => {
        // Define status priority order
        const statusOrder = {
          pending: 1,
          scheduled: 2,
          accepted: 3,
          // All other statuses will have higher numbers
          "canceled-resubmission-requested": 4,
          rejected: 5
        };

        // Get status priorities (default to highest number if status not found)
        const statusA = statusOrder[a.status] || 999;
        const statusB = statusOrder[b.status] || 999;

        // If status is different, sort by status priority
        if (statusA !== statusB) {
          return statusA - statusB;
        }

        // For pending and scheduled status, sort by priority if it's a SchoolTour
        if ((a.status === 'pending' || a.status === 'scheduled') && 
            a.__t === 'SchoolTour' && b.__t === 'SchoolTour') {
          return getPriorityScore(b) - getPriorityScore(a);
        }

        // For same status and not pending/scheduled SchoolTours, sort by date
        return new Date(b.visitDate) - new Date(a.visitDate);
      });
    }
    
    // Rest of the sorting options remain the same
    return sortedApplications.sort((a, b) => {
      switch (sortOption) {
        case "date":
          return new Date(b.visitDate) - new Date(a.visitDate);
        case "schoolName":
          return a.applicant?.name.localeCompare(b.applicant?.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "priority":
          return getPriorityScore(b) - getPriorityScore(a);
        case "appliedDate":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  };

  const getPriorityScore = (application) => {
    switch (application.applicant?.priority) {
      case "High":
        return 3;
      case "Medium":
        return 2;
      case "General":
        return 1;
      default:
        return 0;
    }
  };
  const checkIfSlotIsAvailable = (slot) => {

    return slotInformation.some((s) => s.slot.slotDay === slot.slotDay && s.slot.slotTime === slot.slotTime);

  };


  const handleWeekChange = (direction) => {
    setCurrentWeekIndex((prevIndex) => {
      const newIndex = prevIndex + direction;
      return newIndex < 0 ? weeklySchedules.length - 1 : newIndex % weeklySchedules.length;
    });
  };

  const toggleWeeklySchedules = () => {
    setShowWeeklySchedules((prev) => !prev);
  };

  const tourFilteredApplications = sortApplications(
    applications.filter((app) => app.__t === tourType)
  );

  const toggleRowExpansion = (applicationId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  const renderReserveDatesButton = (application) => {
    if (!application.reserveDates || application.reserveDates.length <= 1) return null;
    
    return (
      <button 
        className="expand-dates-button"
        onClick={() => toggleRowExpansion(application._id)}
      >
        {expandedRows.has(application._id) ? 'Hide Dates' : 'Show All Dates'}
      </button>
    );
  };

  const renderExpandedDates = (application) => {
    if (!expandedRows.has(application._id)) return null;

    return (
      <tr className="expanded-dates-row">
        <td colSpan="100%">
          <div className="reserved-dates-container">
            <h4>Reserved Dates:</h4>
            <ul>
              {application.reserveDates.map((date, index) => (
                <li key={index}>
                  {new Date(date.visitDate).toLocaleDateString()} at {date.visitTime}
                </li>
              ))}
            </ul>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="applications-page-container">
      <h1>APPLICATIONS</h1>
      <div className="controls-container">
        <div className="controls-left">
          <TypeSelectionTrio
            setShowType={setTourType}
            showType={tourType}
            haveFairButton={false}
            upperCase={false}
          />
          
          <div className="filter-sort-group">
            <div className="filter-controls">
              <label htmlFor="filter">Filter by Status:</label>
              <select
                id="filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="canceled-resubmission-requested">Canceled</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="sort-controls">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="date">Date (Latest)</option>
                <option value="appliedDate">Applied Date</option>
                <option value="schoolName">School Name</option>
                <option value="status">Status</option>
                {tourType === "SchoolTour" && <option value="priority">Priority</option>}
              </select>
            </div>
            
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="controls-right">
          <button
            className={`weekly-schedule-toggle ${showWeeklySchedules ? "soft-red" : "green"}`}
            onClick={() => setShowWeeklySchedules(!showWeeklySchedules)}
          >
            {showWeeklySchedules ? "Hide Schedule" : "Show Schedule"}
          </button>
          <button
            className="rebuild-schedules-button"
            onClick={handleRebuildSchedules}
          >
            Rebuild Schedules
          </button>
        </div>
      </div>

      { showWeeklySchedules ? !isLoadingWeeklySchedules &&( 
        <div className="weekly-schedule">
          <div className="weekly-controls">
            <button onClick={() => handleWeekChange(-1)}>← Previous</button>
            <p className="date-range">
              {new Date(weeklySchedules[currentWeekIndex]?.weekBeginning).toLocaleDateString("en-GB")} - 
              {new Date(weeklySchedules[currentWeekIndex]?.weekEnding).toLocaleDateString("en-GB")}
            </p>
            <button onClick={() => handleWeekChange(1)}>Next →</button></div>
          <div className="schedule-info">
            <p><span className="legend accepted"></span> Accepted</p>
            <p><span className="legend scheduled"></span> Scheduled</p> 
          </div>
          {weeklySchedules.length > 0 && weeklySchedules[currentWeekIndex]?.slots ? (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["09:00", "11:00", "13:30", "16:00"].map((time) => (
                  <tr key={time}>
                    <td>{time}</td>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const slot = weeklySchedules[currentWeekIndex].slots.find(
                        (s) => s.slotDay === day && s.slotTime === time
                      );
                      return (
                        <td key={day}>
                          {slot ? (
                            slot.event ? (
                              <div
                                className="event"
                                style={{
                                  backgroundColor:
                                    slot.event.status === "scheduled"
                                      ? "#fef3c7"
                                      : slot.event.status === "accepted"
                                      ? "#d1fae5"
                                      : "#edf2f7",
                                }}
                              >
                                {slot.event.schoolName}
                                <span
                                  className="remove-cross"
                                  onClick={() =>
                                    handleRemoveEvent(slot)
                                  }
                                >
                                  ✖
                                </span>
                              </div>
                            ) : ( checkIfSlotIsAvailable(slot) ? (
                              <button
                                className="add-event-button"
                                onClick={async () => {
                                  const schoolNames = await handleAddEvent(
                                    weeklySchedules[currentWeekIndex].weekBeginning,
                                    day,
                                    time
                                  );
                                  setPopup({ show: true, slot, schoolNames });
                                }}
                              >
                                +Add Event
                              </button>) : (
                                <div className="event" style={{ backgroundColor: "#f9f9f9" }}>
                                  No event Possible
                                </div>
                              )
                            )
                          ) : (
                            <p>No event</p>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No schedules available</p>
          )}
            { popup.show && (
              <div className="popup-overlay">
                <div className="popup-content">
                  <h3>Please select an Event:</h3>
                  <ul>
                    {popup.schoolNames.length > 0 ? (
                      popup.schoolNames.map((schoolName) => (
                        <li
                          key={schoolName}
                          onClick={() => {
                            if (!popup.loadingItem) {
                              handlePopupSelections(schoolName, popup.slot);
                            }
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: popup.loadingItem ? "not-allowed" : "pointer",
                            opacity: popup.loadingItem && popup.loadingItem !== schoolName ? 0.5 : 1,
                          }}
                        >
                          <span>{schoolName}</span>
                          {popup.loadingItem === schoolName && (
                            <span className="popup-loading-spinner"></span>
                          )}
                        </li>
                      ))
                    ) : (
                      <p>No matching events available.</p>
                    )}
                  </ul>

                  <button
                    className="popup-close"
                    onClick={() =>
                      setPopup({ show: false, slot: null, schoolNames: [], loadingItem: null })
                    }
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

        </div>

        
      ) : (
        <GeneralTable
          key={tourType}
          showFairs={false}
          showTours={true}
          showExtraProperties={{
            SchoolTour: [ "priority", "city", "studentCount", "contactPerson", "email", "phoneNumber", "applicationDate"],
            IndividualTour: ["studentName", "studentHighSchool", "majorOfInterest", "email", "phoneNumber", "applicationDate"],
          }}
          setMessage={setMessage}
          user={user}
          events={tourFilteredApplications}
          statusFilter={filterStatus}
          searchTerm={searchTerm}
          showType={tourType}
          setIsLoading={setIsLoading}
          EventRowActions={ApplicationsRowActions}
          extraRowContent={(application) => (
            <>
              {renderReserveDatesButton(application)}
              {renderExpandedDates(application)}
            </>
          )}
        />
      )}
      {(isLoading || (showWeeklySchedules && isLoadingWeeklySchedules))&& <LoadingSpinner />}
    </div>
  );
}
;

export default Applications;
