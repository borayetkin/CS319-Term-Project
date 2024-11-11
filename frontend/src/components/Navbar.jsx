import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode
import "../styles/Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // New state to track if user is admin
  const [isCoordinator, setIsCoordinator] = useState(false); // Add coordinator state
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = jwtDecode(token); // Decode the token
      if (decodedToken.role === "admin") {
        setIsAdmin(true); // Check if the user is admin
      }
      if (decodedToken.role === "coordinator") {
        setIsCoordinator(true);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false); // Reset admin status after logout
    setIsCoordinator(false); // Reset coordinator status
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">ATOM</Link>
      </div>
      <ul className="nav-links">
        {isLoggedIn ? (
          isCoordinator ? (
            // Coordinator Navigation
            <>
              <li>
                <Link to="/events">Events</Link>
              </li>
              <li>
                <Link to="/applications">Applications</Link>
              </li>
              <li>
                <Link to="/guides">Guides</Link>
              </li>
              <li>
                <Link to="/availability">Availability</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            // Regular User Navigation
            <>
              <li>
                <Link to="/">Applications</Link>
              </li>
              <li>
                <Link to="/tours">Tours</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin/users">Admin Dashboard</Link>
                </li>
              )}
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          )
        ) : (
          // Not Logged In Navigation
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/tours">Tours</Link>
            </li>
            <li>
              <Link className="auth-button" to="/login">
                Log in
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
