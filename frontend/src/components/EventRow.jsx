import React from "react";
import { Link } from "react-router-dom";
import "../styles/EventRow.css"; // Import the CSS file

const EventRow = ({
  event,
  user,
  EventRowActions,
  setMessage,
  showExtraProperties = [],
}) => {
  if (!event) return null;

  const personIconUrl =
    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const eventIsFull =
    event.assignedUsers?.length >= event.requiredNumberOfGuides;

  const renderExtraProperty = (property) => {
    if (property === "assignedUsers") {
      return (
        <td>
          {event.assignedUsers?.length || 0}
          {event.assignedUsers?.map((user) => (
            <div
              key={user._id}
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <img
                src={personIconUrl}
                alt={user.name}
                title={user.name}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              {user.name}
            </div>
          ))}
        </td>
      );
    } else if (property === "email") {
      return <td>{event.applicant?.email || "N/A"}</td>;
    } else if (property === "phoneNumber") {
      return <td>{event.applicant?.phoneNumber || "N/A"}</td>;
    } else if (property === "priority") {
      const priority = event.applicant?.priority || "N/A";
      let emoji = "";
      let text = ""
      if (priority === "High") {emoji = "🚀"; text = "Focus"}
      else if (priority === "Medium") {emoji = "⭐"; text = "Preferred"}
      else if (priority === "General") {emoji = "🔵"; text = "General"}
      return <td>{`${text} ${emoji}`}</td>;
    } else if (property === "applicationDate") {
      return <td>{ formatLocalDate(event.applicationDate) || "N/A"}</td>;
    } else if (property === "assignedAdvisor"){
      return <td><div style={{display : "flex" , alignItems : "center" ,gap : "5px" , justifyItems : "center" , height : "100%"}}>
        <img src={personIconUrl} alt = {event.assignedAdvisor.name} title={event.assignedAdvisor.name} style={{ width: "20px", cursor: "pointer" }}/>
        {event.assignedAdvisor.name}
      </div></td>;
    }
    else {
      return <td key={property}>{event[property] || "N/A"}</td>;
    }
  };
  const formatLocalDate = (date) => {
    return new Date(date).toLocaleDateString();
  }
  const existingProperties = ["applicant", "visitTime", "visitDate", "status"];
  const renderExtraProperties = () => {
    if (showExtraProperties.length === 0) return null;
    return showExtraProperties.map((property) => {
      if (existingProperties.includes(property)) return null;
      return renderExtraProperty(property);
    });
  };
  return (
   
    (
      <tr key={event._id} className="event-row">
        <td>{event.applicant?.name || "N/A"}</td>
        <td>
          {" "}
          <div className="time">{event.visitTime}</div>
        </td>
        <td>
          {event.visitDate
            ? new Date(event.visitDate).toLocaleDateString()
            : "N/A"}
        </td>
        {renderExtraProperties()}
        <td>{event.status || "N/A"}</td>
        <td className="actions-cell">
          <EventRowActions event={event} user={user} setMessage={setMessage} />
        </td>
      </tr>
    )
  );
};

export default EventRow;
