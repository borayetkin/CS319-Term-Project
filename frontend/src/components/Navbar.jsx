import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import { FiBell } from 'react-icons/fi';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth(token); // Validate the token with the server
      fetchUserProfile(token);
      if (user?.role === 'guide') {
        fetchUnreadNotifications(token);
      }
    } else {
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  }, [user?.role]);

  const checkAuth = async (token) => {
    try {
      const response = await fetch("/api/auth/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setRole(decodedToken.role);
        setIsLoggedIn(true);
      } else {
        // If the token is invalid or expired, clear localStorage
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      window.location.reload();
      setRole("");
      navigate("/"); 
      localStorage.removeItem("token"); // Ensure the token is cleared
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false); // Mark the loading as complete
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUnreadNotifications = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/notifications/unread-count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole("");
    navigate("/"); // Redirect to the home page
  };

  const isActive = (path) => location.pathname === path;

  if (isLoading) {
    return <div className="navbar-loading">Loading...</div>;
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">ATOM</Link>
      </div>
      <ul className="nav-links">
        {isLoggedIn ? (
          <>
            <li>
              <Link
                to="/profile"
                className={isActive("/profile") ? "active" : ""}
              >
                Profile
              </Link>
            </li>
            {["admin", "coordinator"].includes(role) && (
              <li>
                <Link
                  to="/dashboard"
                  className={isActive("/dashboard") ? "active" : ""}
                >
                  Dashboard
                </Link>
              </li>
            )}
            {["admin", "advisor", "guide"].includes(role) && (
              <li>
                <Link
                  to="/events"
                  className={isActive("/events") ? "active" : ""}
                >
                  Events
                </Link>
              </li>
            )}
            {["admin", "coordinator", "advisor"].includes(role) && (
              <li>
                <Link
                  to="/applications"
                  className={isActive("/applications") ? "active" : ""}
                >
                  Applications
                </Link>
              </li>
            )}
            {["admin", "advisor", "guide"].includes(role) && (
              <li>
                <Link
                  to="/assigned-events"
                  className={isActive("/assigned-events") ? "active" : ""}
                >
                  Assigned Events
                </Link>
              </li>
            )}
            {["advisor"].includes(role) && (
              <li>
                <Link
                  to="/manage-guides"
                  className={isActive("/manage-guides") ? "active" : ""}
                >
                  Manage Guides
                </Link>
              </li>
            )}
            {["guide"].includes(role) && (
              <li>
                <Link
                  to="/guide/notifications"
                  className={isActive("/guide/notifications") ? "active" : ""}
                >
                  <div className="notification-icon">
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </div>
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/"
                onClick={handleLogout}
                className={isActive("/logout") ? "active" : ""}
              >
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={isActive("/login") ? "active" : ""}>
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className={isActive("/signup") ? "active" : ""}
              >
                Signup
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
