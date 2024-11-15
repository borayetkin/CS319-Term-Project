import React from "react";
import { Navigate } from "react-router-dom";

const CoordinatorRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  return decodedToken.role === "coordinator" ? children : <Navigate to="/" />;
};

export default CoordinatorRoute;
