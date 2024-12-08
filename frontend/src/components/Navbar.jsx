import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth(token); // Validate the token with the server
    } else {
      setIsLoggedIn(false);
      setIsLoading(false);
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
            {["admin", "advisor","coordinator", "guide"].includes(role) && (
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
