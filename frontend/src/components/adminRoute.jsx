import React from "react";
import { Navigate } from "react-router-dom";

// AdminRoute to protect the admin routes
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  // Check if the user exists and if their role is 'admin'
  if (user && user.role === "admin") {
    return children; // Render the admin page if the user is an admin
  }

  // If not logged in or not admin, redirect to homepage
  return <Navigate to="/" />;
};

export default AdminRoute;
