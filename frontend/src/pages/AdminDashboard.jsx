// AdminDashboard.js
import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => (
  <div className="dashboard-container">
    <aside className="sidebar">
      <h2>Dashboard Menu</h2>
      <ul>
        <li><Link to="/admin/users">View Users</Link></li>
        <li><Link to="/admin/schoolPriority">Change School Priority</Link></li>
        <li><Link to="/admin/settings">Settings</Link></li>
        {/* Add more links as needed */}
      </ul>
    </aside>
    <main className="dashboard-content">
      <Outlet /> {/* This renders content based on the selected route */}
    </main>
  </div>
);

export default AdminDashboard;