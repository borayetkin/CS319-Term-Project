import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      if (checkAuth(token)) {
        
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setIsLoggedIn(true);
        setRole(decodedToken.role);
      }
    }
  }, []);
  const checkAuth = async (token) => {
    try {
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        return false
      }
      return true
    } catch (error) {
      return false

    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole("");
    window.location.href = "/"
  };

  const isActive = (path) => location.pathname === path;

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
            {["admin","advisor", "guide"].includes(role) && (
              <li>
                <Link
                  to="/assigned-events"
                  className={isActive("/assigned-events") ? "active" : ""}
                >
                  Assigned Events
                </Link>
              </li>
            )}
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
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
