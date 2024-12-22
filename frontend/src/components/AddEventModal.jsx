import React, { useState } from "react";
import ReactDOM from "react-dom";
import "../styles/components/AddEventModal.css";


const AddEventModal = ({ slot, weekBeginning, onClose, triggerFetchSchedules }) => {
  const [loadingEventId, setLoadingEventId] = useState(null);

  if (!slot) return null;

  // Filter out already existing events in the slot
  const existingEventIds = new Set(slot.events.map((event) => event._id));
  const filteredEvents = slot.availableEvents.filter((event) => !existingEventIds.has(event._id));

  // Categorize events by status
  const categorizedEvents = {
    pending: [],
    scheduled: [],
    "canceled-resubmission-requested": [],
  };

  filteredEvents.forEach((event) => {
    categorizedEvents[event.status]?.push(event);
  });

  const handleAssignToSlot = async (eventId, status) => {
    if (!slot || !slot.slotDay || !slot.slotTime || !weekBeginning) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    setLoadingEventId(eventId); // Show loading spinner for the selected event

    try {
      // If the event is already scheduled, remove it first
      if (status === "scheduled") {
        const removeResponse = await fetch("http://localhost:3000/api/schedules/remove-from-schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventId }),
        });

        if (!removeResponse.ok) {
          const errorData = await removeResponse.json();
          console.error("Failed to remove event from schedule:", errorData.message);
          setLoadingEventId(null); // Hide spinner
          return; // Stop further execution if removal fails
        }
        console.log("Event successfully removed from schedule.");
      }

      // Assign the event to the new slot
      const assignResponse = await fetch("http://localhost:3000/api/schedules/assign-to-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          weekBeginning,
          slotDay: slot.slotDay,
          slotTime: slot.slotTime,
        }),
      });

      if (assignResponse.ok) {
        console.log("Event successfully assigned to the slot");
        triggerFetchSchedules(); // Trigger fetch in parent component
        onClose(); // Close the modal
      } else {
        const errorData = await assignResponse.json();
        console.error("Failed to assign event to slot:", errorData.message);
      }
    } catch (error) {
      console.error("Error during event assignment:", error.message);
    } finally {
      setLoadingEventId(null); // Hide loading spinner
    }
  };

  const getCurrentDateFromWeekBeginning = (weekBeginning, currentDay) => {
    if (!weekBeginning || !currentDay) {
      console.error("Invalid weekBeginning or currentDay provided");
      return null;
    }
  
    // Days of the week in the same format as your data
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
    // Convert weekBeginning to a Date object
    const weekBeginningDate = new Date(weekBeginning);
  
    // Find the index of the currentDay in the daysOfWeek array
    const dayIndex = daysOfWeek.indexOf(currentDay);
  
    if (dayIndex === -1) {
      console.error("Invalid currentDay provided");
      return null;
    }
  
    // Add the dayIndex to weekBeginningDate to calculate the current date
    const currentDate = new Date(weekBeginningDate);
    currentDate.setDate(weekBeginningDate.getDate() + dayIndex);
  
    return currentDate.toLocaleDateString("en-GB"); // Format as "DD/MM/YYYY"
  };
  

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-event-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Add Event</h3>
        <p>
          {getCurrentDateFromWeekBeginning(weekBeginning, slot.slotDay)}, {slot.slotDay}, {slot.slotTime}
        </p>
        <div className="priority-indicators">
          <div className="indicator indicator-high">
            <span></span> Focused
          </div>
          <div className="indicator indicator-medium">
            <span></span> Preferred
          </div>
          <div className="indicator indicator-general">
            <span></span> General
          </div>
        </div>
        <div className="event-categories">
          {Object.entries(categorizedEvents).map(([status, events]) => (
            <div key={status} className="event-category">
              <h5>{status.charAt(0).toUpperCase() + status.slice(1)}</h5>
              <ul>
                {events.map((event) => (
                  <li
                    key={event._id}
                    className="event-item"
                    data-priority={event.applicant?.priority || "General"}
                    onClick={() => handleAssignToSlot(event._id, event.status)}
                  >
                    <span>{event.schoolName}</span>
                    {loadingEventId === event._id && (
                      <div className="loading-spinner">
                        <div className="spinner-icon"></div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default AddEventModal;
