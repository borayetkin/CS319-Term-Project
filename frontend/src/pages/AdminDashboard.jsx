import React, { useEffect, useState } from "react";
import "../styles/AdminDashboard.css"; // Import CSS

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  // Delete user function
  const deleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/admin/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setUsers(users.filter((user) => user._id !== userId));
        } else {
          const data = await response.json();
          alert(data.message);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  // Update user's role function
  const updateUserRole = async (userId, newRole) => {
    const token = localStorage.getItem("token");

    // Optimistically update the state before making the API call
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, role: newRole } : user
      )
    );

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.message);
        // Revert the state change if the request fails
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role: user.role } : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("An error occurred. Please try again.");
      // Revert the state change if an error occurs
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: user.role } : user
        )
      );
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <h2>Registered Users</h2>
      {users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th className="control-td">Role</th>
              <th className="control-td">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="control-td">
                  <select
                    id="select-role"
                    value={user.role}
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                  >
                    <option value="guide">Guide</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="advisor">Advisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="control-td">
                  <button
                    className="delete-button"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No registered users found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
