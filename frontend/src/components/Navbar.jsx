import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth(token);
    } else {
      setIsLoading(false); // No token means no authentication check needed
    }
  }, []);

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
        localStorage.removeItem("token"); // Ensure invalid token is cleared
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      localStorage.removeItem("token"); // Clear token on error
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false); // Authentication check complete
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole("");
    navigate("/"); // Use navigate for better SPA behavior
  };

  const isActive = (path) => location.pathname === path;

  if (isLoading) {
    // Optionally show a loading spinner or placeholder
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
