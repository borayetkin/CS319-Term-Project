import React from "react";
import { useState } from "react";

import { FaCheck, FaUserMinus,FaMinus } from "react-icons/fa";


const AssignedEventsActions = ({ event ,user,setMessage, handleCompleteEvent ,handleCancelEvent, handleTakeBackAction ,actionInProcess = false, setActionInProcess = ()=>{} }) => {
  const isPast = new Date(event.visitDate) < new Date();
  const isCompleted = event.status.includes("completed") || event.status.includes("canceled");
  const [workHours, setWorkHours] = useState(0);
  
  const handleWorkHours = (e) => {
    const value = e.target.value;
    if (value < 0) {
      return;
    }
    if (value >10) {
        return
    }
    if(value*1000 % 100 !== 0){
        return
    }

    setWorkHours(e.target.value);
  };
  const removeAssignedEvent = async (eventId) => {
    setActionInProcess(true);
    try {
      const token = localStorage.getItem("token");
    console.log(user)
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
    setActionInProcess(false);
  };



  return (
    <>
      {!isCompleted &&  isPast &&(
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div style={ {display : "flex" , flexDirection : "column" }}>
            <label htmlFor="workHours">Enter Work Hours: </label>
            <input
              name="workHours"
              type="number"
              placeholder=""
              value={workHours}
              onChange={handleWorkHours}
              style={{ maxWidth: "80px",cursor: actionInProcess ? "not-allowed" : "pointer" }}
              disabled={actionInProcess}
            />
          </div>
          
          <div style={ {display : "flex" , flexDirection : "row" , gap: "20px", maxHeight :"50px"}}>
          <button
            className={"action-button apply"}
            disabled={actionInProcess}
            style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
            onClick={() => handleCompleteEvent(event._id , workHours)}
          >
            <FaCheck/>
            Complete
          </button>
          <button
            className={"action-button unassign"}
            disabled={actionInProcess}
            style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
            onClick={() => handleCancelEvent(event._id)}
          >
            <FaMinus/>
            Cancel
          </button>
          </div>
        </div>
      )}
      {!isPast && !isCompleted && (
        <button
          className={"action-button unassign"}
          disabled={actionInProcess}
          style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
          onClick={() => removeAssignedEvent(event._id)}
        >
           <FaUserMinus/>
          Unassign
        </button>
      )}
      {isCompleted &&  <button
            className={"action-button unassign"}
            onClick={() => handleTakeBackAction(event._id)}
            disabled={actionInProcess}
            style={{ cursor: actionInProcess ? "not-allowed" : "pointer" }}
          >
            <FaMinus/>
            Take Back
          </button>
      
          }
    </>
  );
};

export default AssignedEventsActions;
