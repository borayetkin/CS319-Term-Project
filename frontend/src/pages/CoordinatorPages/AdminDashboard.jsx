import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../../styles/CoordinatorPages/AdminDashboard.css";

const AdminDashboard = () => {
  const location = useLocation(); // Get the current route
  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    // Fetch user statistics only on the main dashboard route
    const fetchUserStats = async () => {
      if (location.pathname === "/dashboard") {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            "http://localhost:3000/api/users/stats",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const stats = await response.json();
            setUserStats(stats);
          } else {
            console.error("Failed to fetch user statistics");
          }
        } catch (error) {
          console.error("Error fetching user statistics:", error);
        }
      }
    };

    fetchUserStats();
  }, [location.pathname]);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Dashboard Menu</h2>
        <ul>
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
        {/* Render user statistics only on the main dashboard route */}
        {location.pathname === "/dashboard" && (
          <div className="user-stats-container">
            <h2>User Statistics</h2>
            <table className="user-stats-table">
              <thead>
                <tr>
                  <th>User Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((stat, index) => (
                  <tr key={index}>
                    <td>{stat.type}</td>
                    <td>{stat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Outlet for subroutes */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
