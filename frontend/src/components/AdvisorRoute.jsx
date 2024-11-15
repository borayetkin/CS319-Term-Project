import React from "react";
import { Navigate } from "react-router-dom";

const AdvisorRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  return decodedToken.role === "advisor" ? children : <Navigate to="/" />;
};

export default AdvisorRoute;
