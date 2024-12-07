import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../../styles/CoordinatorPages/AdminDashboard.css";

const AdminDashboard = () => (
  <div className="dashboard-container">
    <aside className="sidebar">
      <h2>Dashboard Menu</h2>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/dashboard/ManageFairs">Manage Fairs</Link>
        </li>
        <li>
          <Link to="/dashboard/users">View Users</Link>
        </li>
        <li>
          <Link to="/dashboard/schoolPriority">Change School Priority</Link>
        </li>
        <li>
          <Link to="/dashboard/settings">Settings</Link>
        </li>
      </ul>
    </aside>
    <main className="dashboard-content">
      <Outlet /> {/* Renders nested routes like UsersPage, SettingsPage */}
    </main>
  </div>
);

export default AdminDashboard;
