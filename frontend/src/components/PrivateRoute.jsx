import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Import the jwtDecode library to parse the token

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // If there's no token, redirect to the login page
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);

    // Check if the user's role is allowed to access the route
    if (!allowedRoles.includes(decodedToken.role)) {
      return <Navigate to="/" />; // Redirect to home or another appropriate page
    }

    return children; // Render the children if authorized
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" />; // Redirect to login if the token is invalid
  }
};

export default PrivateRoute;
