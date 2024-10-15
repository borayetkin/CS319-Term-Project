import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode to extract token info

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // New state to track if user is admin
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = jwtDecode(token); // Decode the token
      if (decodedToken.role === "admin") {
        setIsAdmin(true); // Check if the user is admin
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false); // Reset admin status after logout
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Bilkent Tours</Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/tours">Tours</Link>
        </li>

        {isLoggedIn ? (
          <>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            {/* Conditionally render the Admin Dashboard link if the user is an admin */}
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
        ) : (
          <li>
            <Link className="auth-button" to="/login">
              Log in
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
