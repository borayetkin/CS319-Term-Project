import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode
import "../styles/Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = jwtDecode(token);
      if (decodedToken.role === "admin") {
        setIsAdmin(true);
      }
      if (decodedToken.role === "coordinator") {
        setIsCoordinator(true);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsCoordinator(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path; // Helper function to check active link

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">ATOM</Link>
      </div>
      <ul className="nav-links">
        {isLoggedIn ? (
          isCoordinator ? (
            <>
              <li>
                <Link
                  to="/events"
                  className={isActive("/events") ? "active" : ""}
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/applications"
                  className={isActive("/applications") ? "active" : ""}
                >
                  Applications
                </Link>
              </li>
              <li>
                <Link
                  to="/guides"
                  className={isActive("/guides") ? "active" : ""}
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/availability"
                  className={isActive("/availability") ? "active" : ""}
                >
                  Availability
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className={isActive("/profile") ? "active" : ""}
                >
                  Profile
                </Link>
              </li>
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className={isActive("/") ? "active" : ""}>
                  Applications
                </Link>
              </li>
              <li>
                <Link
                  to="/tours"
                  className={isActive("/tours") ? "active" : ""}
                >
                  Tours
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className={isActive("/profile") ? "active" : ""}
                >
                  Profile
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    to="/admin/users"
                    className={isActive("/admin/users") ? "active" : ""}
                  >
                    Admin Dashboard
                  </Link>
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
          <>
            <li>
              <Link to="/" className={isActive("/") ? "active" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/tours" className={isActive("/tours") ? "active" : ""}>
                Tours
              </Link>
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
