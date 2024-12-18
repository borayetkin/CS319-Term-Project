import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
const EventRowActions = ({ event, user, setMessage, events, setEvents, onActionComplete }) => {
  const [actionInProcess, setActionInProcess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);
  const personIconUrl =
    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const isEventSchoolTour = event.__t === "SchoolTour";
  const endpoint = isEventSchoolTour ? "assign-guide" : "apply";
  const rolesThatApply = ["guide", "advisor"];

  useEffect(() => {
    if (user && event) {
      setHasApplied(checkIfUserHasApplied());
      setIsAssigned(checkIfUserIsAssigned());
    }
  }, [event, user, events]);

  const updateEventInState = (eventId, updatedFields) => {
    if (!setEvents) return;
    
    const updatedEvents = events.map(evt => 
      evt._id === eventId 
        ? ({ ...evt, ...updatedFields })
        : evt
    );
    
    
    setEvents(updatedEvents);
  };

  const applyToEvent = async (eventId, endpoint) => {
    try {
      setActionInProcess(true);
      const response = await fetch(`http://localhost:3000/api/events/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          userrole: user.role,
          userid: user._id
        },
        body: JSON.stringify({
          eventID: eventId,
          userID: user._id,
          isSchoolTour: isEventSchoolTour
        }),
      });

      if (response.ok) {
        setMessage(`✅ Successfully ${isEventSchoolTour ? 'assigned to' : 'applied to'} event`);
     
        
        if (isEventSchoolTour) {
          setIsAssigned(true);
        } else {
          setHasApplied(true);
        }

        if (setEvents) {
          if (isEventSchoolTour) {
            setEvents(prevEvents => prevEvents.map(e =>
              e._id === eventId
                ? {
                    ...e,
                    assignedUsers: [...e.assignedUsers, user]
                  }
                : e
            ));
          
          }
          else {
            setEvents(prevEvents => prevEvents.map(e =>
              e._id === eventId
                ? {
                    ...e,
                    appliedUsers: [...e.appliedUsers, user]
                  }
                : e
            ));
          }
        }
        console.log("wtf")
        setActionInProcess(false);
      } else {
        const error = await response.json();
        setMessage(`⚠️ Failed to ${isEventSchoolTour ? 'assign' : 'apply'}: ${error.message}`);
      }
    } catch (error) {
      setMessage("⚠️ Error: " + error.message);
    }
    setActionInProcess(false);
  };

  const removeAssignedEvent = async (eventId) => {
    setActionInProcess(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/events/remove-guide`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ eventID: eventId, userID: user._id }),
        }
      );

      if (response.ok) {
        setMessage("✅ Successfully unassigned from event");
        setIsAssigned(false);
        
        if (setEvents) {
          setEvents(prevEvents =>
            prevEvents.map(e =>
              e._id === eventId
                ? {
                    ...e,
                    assignedUsers: e.assignedUsers.filter(u => u._id !== user._id)
                  }
                : e
            )
          );
        }
      } else {
        const error = await response.json();
        setMessage(`⚠️ Failed to unassign: ${error.message}`);
      }
    } catch (error) {
      setMessage("⚠️ Error: " + error.message);
    }
    setActionInProcess(false);
  };

  const unapplyFromEvent = async (eventId) => {
    setActionInProcess(true);
    try {
      const response = await fetch(`http://localhost:3000/api/events/unapply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          userid: user._id
        },
        body: JSON.stringify({
          eventID: eventId
        }),
      });

      if (response.ok) {
        setMessage("✅ Successfully unapplied from event");
        setHasApplied(false);
        
        if (setEvents) {
          setEvents(prevEvents =>
            prevEvents.map(e =>
              e._id === eventId
                ? {
                    ...e,
                    appliedUsers: e.appliedUsers.filter(u => 
                      typeof u === 'string' ? u !== user._id : u._id !== user._id
                    )
                  }
                : e
            )
          );
        }
      } else {
        const error = await response.json();
        setMessage(`⚠️ ${error.message || "Failed to unapply from event"}`);
      }
    } catch (error) {
      setMessage("⚠️ Error unapplying from event");
    }
    setActionInProcess(false);
  };

  const eventIsFull = event.assignedUsers?.length >= event.requiredNumberOfGuides;

  const checkIfUserHasApplied = () => {
    if (!user || !event) return false;

    if (isEventSchoolTour) {
      return event.assignedUsers?.some(
        (assignedUser) => assignedUser._id === user._id
      );
    } else {
      return event.appliedUsers?.some(
        (appliedUser) => appliedUser._id === user._id
      ) || event.appliedUsers?.includes(user._id);
    }
  };

  const checkIfUserIsAssigned = () => {
    if (!user || !event) return false;
    return event.assignedUsers?. some(
      (assignedUser) => assignedUser._id === user._id
    );
  };

  return (
    <div className="action-buttons">
      {user &&
        rolesThatApply.includes(user.role) &&
        !hasApplied &&
        !isAssigned &&
        !eventIsFull && (
          <button
            className="action-button apply"
            onClick={() => applyToEvent(event._id, endpoint)}
            disabled={actionInProcess}
            style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
          >
            <i className="fas fa-hand-point-up"></i>
            {isEventSchoolTour ? "Assign" : "Apply"}
          </button>
        )}

      {user &&
        !isEventSchoolTour &&
        rolesThatApply.includes(user.role) &&
        hasApplied &&
        !isAssigned && (
          <button
            className="action-button unapply"
            onClick={() => unapplyFromEvent(event._id)}
            disabled={actionInProcess}
            style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
          >
            <i className="fas fa-times"></i>
            Unapply
          </button>
        )}

      {user && isAssigned && (
        <button
          className="action-button unassign"
          onClick={() => removeAssignedEvent(event._id)}
          disabled={actionInProcess}
          style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
        >
          <i className="fas fa-user-minus"></i>
          Unassign
        </button>
      )}
    </div>
  );
};

export default EventRowActions;
