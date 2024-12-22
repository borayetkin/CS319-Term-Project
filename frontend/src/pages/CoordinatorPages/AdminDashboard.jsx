import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../../styles/CoordinatorPages/AdminDashboard.css";
import { RiDashboardLine, RiCalendarEventLine, RiUserLine, RiListCheck, RiSettings4Line, RiTeamLine, RiFileListLine, RiUserSearchLine } from "react-icons/ri";

const AdminDashboard = () => {
  const location = useLocation();
  
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Dashboard Menu</h2>
        <ul>
          <li>
            <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
              <RiDashboardLine style={{marginRight: "12px"}} /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/dashboard/ManageFairs" className={location.pathname.includes("/ManageFairs") ? "active" : ""}>
              <RiCalendarEventLine style={{marginRight: "12px"}} /> Manage Fairs
            </Link>
          </li>
          <li>
            <Link to="/dashboard/users" className={location.pathname.includes("/users") ? "active" : ""}>
              <RiUserLine style={{marginRight: "12px"}} /> View Users
            </Link>
          </li>
          <li>
            <Link to="/dashboard/guides" className={location.pathname.includes("/guides") ? "active" : ""}>
              <RiTeamLine style={{marginRight: "12px"}} /> View Guides
            </Link>
          </li>
          <li>
            <Link to="/dashboard/schoolPriority" className={location.pathname.includes("/schoolPriority") ? "active" : ""}>
              <RiListCheck style={{marginRight: "12px"}} /> School Priority
            </Link>
          </li>
          <li>
            <Link to="/dashboard/logs" className={location.pathname.includes("/logs") ? "active" : ""}>
              <RiFileListLine style={{marginRight: "12px"}} /> View Logs
            </Link>
          </li>
          <li>
            <Link to="/dashboard/applicants" className={location.pathname.includes("/applicants") ? "active" : ""}>
              <RiUserSearchLine style={{marginRight: "12px"}} /> View Applicants
            </Link>
          </li>
          <li>
            <Link to="/dashboard/settings" className={location.pathname.includes("/settings") ? "active" : ""}>
              <RiSettings4Line style={{marginRight: "12px"}} /> Settings
            </Link>
          </li>
        </ul>
      </aside>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
