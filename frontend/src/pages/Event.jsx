import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/Event.css";
import "../styles/TourApplication.css";
import UserSearch from "../components/UserSearch";

const Event = ({assignGuideOpened = false}) => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedinUser, setUser] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const personIconUrl = "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const queryParams = new URLSearchParams(window.location.search);
  const assignGuideQuery = queryParams.get("assignGuide");

  useEffect(() => {
    if (assignGuideQuery === "true") {
      setShowUserSearch(true);
    }
  }, [assignGuideQuery]);

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
        if (!assigneesRes.ok) {
          throw new Error("Failed to fetch assignees");
        }

        const assignees = await assigneesRes.json();

        setAssignedUsers(assignees);
        console.log(eventData);
        
        setEvent(eventData);
        console.log("fetching bb");
        
        setIsLoading(false);
        console.log("fetching aa");
        
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
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const userData = await response.json();
        setUser(userData);

      } catch (error) {
        setError(error.message);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchEvent(token);
      fetchUserProfile(token);
    }else{
      window.location.href = "/"
    }
  }, [id]);

  const handleAddUser = async (selectedUser) => {
    const token = localStorage.getItem("token");
    setShowUserSearch(false);

    try {
      const assignResponse = await fetch(
        "http://localhost:3000/api/events/assign-guide",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userID: selectedUser,
            eventID: event._id,
          }),
        }
      );
  
      if (!assignResponse.ok) {
        const errorData = await assignResponse.json();
        throw new Error(errorData.message || "Failed to assign guide");
      }else{
        window.location.href = window.location.pathname;
      }
    } catch (error) {
      setError(error.message)
    }
    
  };
  
  const handleRemoveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      console.log(userId);
      
      const removeResponse = await fetch(
        "http://localhost:3000/api/events/remove-guide",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userID: userId,
            eventID: event._id,
          }),
        }
      );
  
      if (!removeResponse.ok) {
        const errorData = await removeResponse.json();
        throw new Error(errorData.message || "Failed to remove guide");
      } else{
        window.location.reload();
      }
    } catch (error) {
      setError(error.message)
    }
  };
  if (isLoading) {
    return <div>Loading...</div>
  }


  return (
   

    <>
     {isLoading && (<div>Loading...</div>)}
    {error && <div>{error}</div>}
    {!isLoading &&
      (
    <div className="event-container">
      <div className="event-info">
        {event.__t === "IndividualTour" && (
          <p className="highlight">Student Name: {event.contactPerson}</p>
        )}
        {event.__t === "SchoolTour" && (
          <p className="highlight">School Name: {event.schoolName}</p>
        )}
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
            <p>Number of Students: {event.studentCount}</p>
          </>
        )}

      </div>
      <div className="assigned-users">
        {event.assignedAdvisor && (
          <>
          <h3>Advisor :</h3>
          <div className="assigned-user">
            
           
            <img src={personIconUrl} alt="Profile" />
            <span>{event.assignedAdvisor.name} </span>
         
          </div>
          </>
        )}
        <h2>Assigned Users</h2>
        {assignedUsers &&
          assignedUsers.map((user) => (
            <div key={user._id} className="assigned-user">
              <img src={personIconUrl} alt="Profile" />
              <span>{user.name}</span>
              {loggedinUser && loggedinUser.role === "advisor" && event.assignedAdvisor._id === loggedinUser._id &&(
                <button
                  className="remove-button"
                  onClick={() => handleRemoveUser(user._id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        {loggedinUser && loggedinUser.role === "advisor" && event.assignedAdvisor._id === loggedinUser._id &&(
          <button className="add-user-button" onClick={() => setShowUserSearch(true)}>
            Add User
          </button>
        )}
      </div>
      {showUserSearch && event.assignedAdvisor._id === loggedinUser._id &&(
        <UserSearch
          userType="guide"
          onClose={() => setShowUserSearch(false)}
          onSelectUser={handleAddUser}
        />
      )}
    </div>)}
    </>
  )
};

export default Event;
