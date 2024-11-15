import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(""); // Store the user's role
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setIsLoggedIn(true);
      setRole(decodedToken.role); // Set the user's role from the token
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole("");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">ATOM</Link>
      </div>
      <ul className="nav-links">
        {isLoggedIn ? (
          role === "admin" ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className={isActive("/profile") ? "active" : ""}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={isActive("/dashboard") ? "active" : ""}
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/events"
                  className={isActive("/admin/events") ? "active" : ""}
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/applications"
                  className={isActive("/admin/applications") ? "active" : ""}
                >
                  Applications
                </Link>
              </li>
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : role === "coordinator" ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className={isActive("/profile") ? "active" : ""}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={isActive("/dashboard") ? "active" : ""}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/coordinator/applications"
                  className={
                    isActive("/coordinator/applications") ? "active" : ""
                  }
                >
                  Applications
                </Link>
              </li>
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : role === "advisor" ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className={isActive("/profile") ? "active" : ""}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/advisor/events"
                  className={isActive("/advisor/events") ? "active" : ""}
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/advisor/applications"
                  className={isActive("/advisor/applications") ? "active" : ""}
                >
                  Applications
                </Link>
              </li>
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : role === "guide" ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className={isActive("/profile") ? "active" : ""}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/guide/assigned-events"
                  className={isActive("/guide/assigned-events") ? "active" : ""}
                >
                  Assigned Events
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
          )
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
