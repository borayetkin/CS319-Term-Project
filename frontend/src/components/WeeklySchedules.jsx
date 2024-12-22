import React, { useState, useEffect, useRef } from 'react';
import '../styles/components/WeeklySchedules.css';
import { LuRefreshCw } from "react-icons/lu";

const WeeklySchedules = ({ onAddEvent }) => {
  const [schedules, setWeeklySchedules] = useState([]);
  const [currentIndex, setCurrentWeekIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [activeSlot, setActiveSlot] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const popupRef = useRef(null);
  
  useEffect(() => {
    fetchSchedules();

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActiveEvent(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSchedules = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/schedules/load", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Schedules:", data); // Debugging: Check the backend response
        setWeeklySchedules(data);
      } else {
        setMessage("Failed to fetch weekly schedules");
      }
    } catch (error) {
      setMessage("Error fetching weekly schedules: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSchedules = async () => {
    console.log("Refreshing schedules...");
    setIsLoading(true); // Start spinning
    await fetchSchedules();
  };

  const handleWeekChange = (direction) => {
    setCurrentWeekIndex((prevIndex) => {
      const newIndex = prevIndex + direction;
      if (newIndex < 0) {
        return schedules.length - 1; // Go to the last week if at the beginning
      }
      return newIndex % schedules.length; // Loop back to the start
    });
  };

  const handleAutoAssign = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("No token found. Please log in.");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/schedules/rebuild", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        const data = await response.json();
        setWeeklySchedules(data);
      } else {
        setMessage("Failed to rebuild schedules");
      }
    } catch (error) {
      setMessage("Error rebuilding schedules: " + error.message);
    } finally {
      setIsLoading(false);
      setIsSpinning(false);
    }
  };

  const handleClearSchedules = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      setIsLoading(false);
      return;
    }
  
    try {
      // Backend call to clear scheduled events
      const response = await fetch("http://localhost:3000/api/schedules/clear", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        setMessage("Scheduled events cleared successfully");
        await fetchSchedules();
      } else {
        setMessage("Failed to clear scheduled events");
      }
    } catch (error) {
      setMessage("Error clearing scheduled events: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToSlot = async (eventId) => {
    setSelectedEventId(eventId); // Show loading for the selected event
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3000/api/schedules/assign-to-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slotId: activeSlot._id, // Use activeSlot to get the slot ID
          eventId,
        }),
      });

      if (response.ok) {
        setMessage("Event assigned successfully!");
        fetchSchedules(); // Refresh schedules after assigning
      } else {
        const errorData = await response.json();
        setMessage("Failed to assign event: " + errorData.message);
      }
    } catch (error) {
      setMessage("Error assigning event: " + error.message);
    } finally {
      setActiveSlot(null); // Close the popup
      setSelectedEventId(null); // Remove loading
    }
  };

  const closePopup = () => {
    setActiveSlot(null);
    document.body.style.overflow = "auto"; // Re-enable scrolling
  };

  const renderAddEventPopup = () => {
    if (!activeSlot) return null;

    const categorizedEvents = {
      pending: [],
      scheduled: [],
      "canceled-resubmission-requested": [],
    };

    // Categorize events
    activeSlot.availableEvents.forEach((event) => {
      categorizedEvents[event.status]?.push(event);
    });

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const popupStyle = {
      left: scrollX + viewportWidth / 2 - 200, // Adjust for popup width (e.g., 400px)
      top: scrollY + viewportHeight / 2 - 150, // Adjust for popup height (e.g., 300px)
    };

    return (
      <div
        className="modal-overlay"
        onClick={closePopup} // Clicking outside closes the popup
      >
        <div
          className="add-event-popup"
          style={popupStyle} // Set dynamic position
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <h4>Available Events</h4>
          <div className="event-categories">
            {Object.entries(categorizedEvents).map(([status, events]) => (
              <div key={status} className="event-category">
                <h5>{status.charAt(0).toUpperCase() + status.slice(1)}</h5>
                <ul>
                  {events.map((event) => (
                    <li key={event._id} className="event-item">
                      <span>{event.schoolName}</span>
                      {selectedEventId === event._id ? (
                        <span className="loading-spinner">Loading...</span>
                      ) : (
                        <button onClick={() => handleAssignToSlot(event._id)}>
                          Assign
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button className="close-popup" onClick={closePopup}>
            Close
          </button>
        </div>
      </div>
    );
  };

  const handleEventClick = (event, buttonElement) => {
    const rect = buttonElement.getBoundingClientRect(); 
    const container = document.querySelector(".weekly-schedule-container");

    if (!container) {
      console.error("Container element not found");
      return;
    }
  
    const containerRect = container.getBoundingClientRect();
  
    setActiveEvent(event);
    setPopupPosition({
      x: rect.left - containerRect.left + container.scrollLeft,
      y: rect.bottom - containerRect.top + container.scrollTop,
      width: rect.width,
    });
  };

  const handleReserveDateClick = async (eventId, newReserveDate) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      setMessage("No token found. Please log in.");
      return;
    }
  
    // Extract new slot details
    const { visitDate, visitTime } = newReserveDate;
    const slotDay = daysOfWeek[(new Date(visitDate).getDay() + 6) % 7]; // Match Monday-Sunday format
    const weekBeginning = currentWeek?.weekBeginning;
  
    try {
      // Call the remove-from-schedule API
      const removeResponse = await fetch("http://localhost:3000/api/schedules/remove-from-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });
  
      if (!removeResponse.ok) {
        throw new Error("Failed to remove event from schedule");
      }
  
      // Call the assign-to-slot API
      const assignResponse = await fetch("http://localhost:3000/api/schedules/assign-to-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, weekBeginning, slotDay, slotTime: visitTime }),
      });
  
      if (!assignResponse.ok) {
        throw new Error("Failed to assign event to slot");
      }
  
      setMessage("Event successfully reassigned.");
      await fetchSchedules(); // Refresh data after successful operation
    } catch (error) {
      setMessage(`Error handling reserve date: ${error.message}`);
      console.error(error);
    }

    setActiveEvent(null);
  };

  const handleRemoveEvent = async (eventId) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      setMessage("No token found. Please log in.");
      return;
    }
  
    try {
      // Call the remove-from-schedule API
      const removeResponse = await fetch("http://localhost:3000/api/schedules/remove-from-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });
  
      if (!removeResponse.ok) {
        throw new Error("Failed to remove event from schedule");
      }
  
      // Update frontend data by removing the event from its slot
      setWeeklySchedules((prevSchedules) =>
        prevSchedules.map((schedule) => ({
          ...schedule,
          slots: schedule.slots.map((slot) => ({
            ...slot,
            events: slot.events.filter((event) => event._id !== eventId),
          })),
        }))
      );
  
      setMessage("Event removed successfully.");
    } catch (error) {
      setMessage(`Error removing event: ${error.message}`);
      console.error(error);
    }
  
    setActiveEvent(null); // Close the popup
  };

  const renderPopup = () => {
    if (!activeEvent) return null;

    const otherReserveDates = activeEvent.reserveDates.filter(
      (date) =>
        new Date(date.visitDate).toISOString() !==
        new Date(activeEvent.visitDate).toISOString()
    );

    return (
      <div
        ref={popupRef}
        className={`popup ${activeEvent ? "visible" : ""}`}
        style={{
          top: popupPosition.y,
          left: popupPosition.x,
          width: popupPosition.width,
        }}
      >
        <button
          className="remove-event-button"
          onClick={() => handleRemoveEvent(activeEvent._id)}
        >
          Remove Event
        </button>
        
      <h4>Assign event to:</h4>
        <ul>
          {otherReserveDates.map((reserve, index) => (
            <li
              key={index}
              onClick={() => handleReserveDateClick(activeEvent._id, reserve)}
            >
              {new Date(reserve.visitDate).toLocaleDateString("en-GB")} at{" "}
              {reserve.visitTime}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const [confirmationPopup, setConfirmationPopup] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    onConfirm: null,
    message: "",
  });

  const showConfirmationPopup = (event, action, message) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const container = document.querySelector(".weekly-schedule-container");
    const containerRect = container.getBoundingClientRect();
  
  
    setConfirmationPopup({
      isVisible: true,
      position: { x: rect.left - containerRect.left + container.scrollLeft, y: rect.bottom - containerRect.top + container.scrollTop},
      onConfirm: action,
      message,
    });
  };

  const closeConfirmationPopup = () => {
    setConfirmationPopup({ isVisible: false, position: { x: 0, y: 0 }, onConfirm: null, message: "" });
  };
  
  const renderConfirmationPopup = () => {
    if (!confirmationPopup.isVisible) return null;
  
    return (
      <div
        className="confirmation-popup"
        style={{
          position: "absolute",
          top: confirmationPopup.position.y,
          left: confirmationPopup.position.x,
          width: "150px",
          zIndex: 9999,
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p>{confirmationPopup.message || "Are you sure?"}</p>
        <div className="confirmation-popup-buttons">
          <button
            className="confirmation-yes-button"
            onClick={() => {
              if (confirmationPopup.onConfirm) {
                confirmationPopup.onConfirm(); // Execute the stored action
              }
              closeConfirmationPopup();
            }}
          >
            Yes
          </button>
          <button className="confirmation-cancel-button" onClick={closeConfirmationPopup}>
            Cancel
          </button>
        </div>
      </div>
    );
  };
  

  const handleAddEventClick = (slot) => {
    onAddEvent(slot); // Notify Applications to open the modal
  };
  
  

  const currentWeek = schedules[currentIndex];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDayIndex = (new Date().getDay() + 6) % 7 +3; // Adjust to match your table's first day (Monday)
  const currentDay = daysOfWeek[currentDayIndex];


  return (
    <div className="weekly-schedule-container">
      <div className="weekly-controls">
        <button onClick={() => handleWeekChange(-1)}>← Previous</button>
        <p className="date-range">
          {isLoading ? (
            <span className="loading-text">Loading Schedules...</span>
          ) : (
            <>
              <span className="date-range-dates">
                {new Date(currentWeek?.weekBeginning).toLocaleDateString("en-GB")} -{" "}
                {new Date(currentWeek?.weekEnding).toLocaleDateString("en-GB")}
              </span>
            </>
          )}
        </p>
        <button onClick={() => handleWeekChange(1)}>Next →</button>
      </div>

      {/* Legend and Buttons */}
      <div className="legend-and-actions">
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color event-scheduled"></span>
            <span>Scheduled</span>
          </div>
          <div className="legend-item">
            <span className="legend-color event-accepted"></span>
            <span>Accepted</span>
          </div>
          <div className="legend-item">
            <span className="legend-color event-completed-verified"></span>
            <span>Completed-Verified</span>
          </div>
        </div>

        <div className="actions">
          <button className="auto-assign-button" onClick={(e) =>
            showConfirmationPopup(e, handleAutoAssign, "Do you want to auto-assign all schedules?")
          }>
            Auto Assign
          </button>
          <button className="clear-schedules-button" onClick={(e) =>
            showConfirmationPopup(e, handleClearSchedules, "Do you want to clear all schedules?")
          }>
            Clear Schedules
          </button>
          <LuRefreshCw
            className={`refresh-button ${isLoading ? "spin" : ""}`}
            onClick={refreshSchedules}
          />
        </div>
      </div>

      {isLoading ? ( "" ) : (

      <table className="weekly-schedule-table">
        <thead>
          <tr>
            <th>Time</th>
            {daysOfWeek.map((day, index) => (
              <th key={day} className={currentDayIndex === index ? "highlight" : ""}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {["09:00", "11:00", "13:30", "16:00"].map((time) => (
            <tr key={time}>
              <td>{time}</td>
              {daysOfWeek.map(
                (day, index) => {
                  if (!currentWeek || !currentWeek.slots) {
                    // If currentWeek or slots is undefined, render a placeholder
                    return <td key={day}><div>No data</div></td>;
                  }
                  <td key={day} className={currentDayIndex === index ? "highlight" : ""}></td>

                  const slot = currentWeek.slots.find(
                    (s) => s.slotDay === day && s.slotTime === time
                  );

                  if (!slot) {
                    return <td key={day}><div>No slot</div></td>;
                  }

                  return (
                    <td key={day}>
                      {slot.events.length > 0 && (
                        <ul>
                          {slot.events.map((event) => (
                            <li key={event._id}>
                              <button
                                className={`event-button event-${event.status.toLowerCase().replace(/_/g, "-")}`}
                                onClick={(e) => {
                                  if (event.status === "scheduled") {
                                    handleEventClick(event, e.currentTarget);
                                  }
                                }}
                              >
                                <span>{event.schoolName || "Unknown School"}</span>
                                <span
                                  className={`priority-label ${
                                    event.applicant?.priority === "High"
                                      ? "priority-high"
                                      : event.applicant?.priority === "Medium"
                                      ? "priority-medium"
                                      : "priority-general"
                                  }`}
                                >
                                  {event.applicant?.priority === "High"
                                    ? "Focus"
                                    : event.applicant?.priority === "Medium"
                                    ? "Preferred"
                                    : "General"}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        className="add-event-button"
                        onClick={() => handleAddEventClick(slot)}
                      >
                        Add Event
                      </button>
                    </td>
                  );
                }
              )}
            </tr>
          ))}
        </tbody>
      </table>
      )}
      {renderPopup()}
      {renderAddEventPopup()}
      {renderConfirmationPopup()}
    </div>
  );
};

export default WeeklySchedules;
