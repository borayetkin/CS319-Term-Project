import React, { useState, useEffect } from "react";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import "../../styles/GuidePages/Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const buttonStyle = {
    fontSize: "0.3rem",
    padding : "0.5rem",
    color: "gray",
    backgroundColor: "white",
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchNotifications(token);
    }
  }, []);

  const fetchNotifications = async (token) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/notifications/guide",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setMessage("Failed to fetch notifications");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };
  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setNotifications(notifications.filter((notif) => notif._id !== notificationId));
      }
    }
    catch (error) {
      setMessage("Error deleting notification");
    }
  };
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((notif) =>
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      setMessage("Error marking notification as read");
    }
  };

  return (
    <div className="notifications-container">
      <h1>Notifications</h1>
      {message && <p className="message">{message}</p>}

      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${
                notification.read ? "read" : "unread"
              }`}
            >
              <div className="notification-content">
                <FiBell className="notification-icon" />
                <div className="notification-text">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={ { justifySelf : "flex-end", display : "flex" , alignContent : "center", gap : "1rem"}}>
              {!notification.read && (
                <button
                  className="mark-read-button"
                  onClick={() => markAsRead(notification._id)}
                  style={{...buttonStyle , fontSize: "1rem"}}
                >
                  <FiCheck />
                  <p>Mark as Read</p>
                </button>
              )}
              <button
                className="action-button delete"
                onClick={() => handleDelete(notification._id)}
                title="Delete Application"
                style={{...buttonStyle , color: "red"}}
              >
                <FiTrash2 size={16} />
              </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications yet</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
