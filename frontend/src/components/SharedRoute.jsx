import React from "react";
import { Navigate } from "react-router-dom";

const SharedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  const role = decodedToken.role;

  if (role === "coordinator" || role === "advisor") {
    return children;
  } else {
    return <Navigate to="/" />;
  }
};

export default SharedRoute;
