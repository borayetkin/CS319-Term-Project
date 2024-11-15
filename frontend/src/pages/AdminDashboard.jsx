import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import "../styles/AdminDashboard.css";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users.");
        }

        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="users-table-container">
      <h2>Registered Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SchoolPriority = () => <div>School Priority Component</div>;
const Settings = () => <div>Settings Component</div>;

const AdminDashboard = () => (
  <div className="dashboard-container">
    <aside className="sidebar">
      <h2>Dashboard Menu</h2>
      <ul>
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
      <Outlet /> {/* This renders content based on the nested route */}
    </main>
  </div>
);

export { AdminDashboard, UsersTable, SchoolPriority, Settings };
