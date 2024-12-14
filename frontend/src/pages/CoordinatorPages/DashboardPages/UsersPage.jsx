// UsersPage.js
import React, { useEffect, useState } from "react";
import "../../../styles/UsersPage.css"; // Import CSS
import { Link } from "react-router-dom";
import { majors } from "../../TourApplication.jsx"; // Adjust the import path as necessary
import LoadingSpinner from '../../../components/LoadingSpinner'; // Add this import
import { FaPlus } from "react-icons/fa";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState({
    id: "",
    email: "",
    role: "guide",
    major: "",
    assignedDay: ""
  });
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:3000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUsers(data);
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        setError(err.message);
        setLoading(false); // Set loading to false if there's an error
      }
    };

    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");

    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

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

  const updateUserRole = async (userId, newRole) => {
    const token = localStorage.getItem("token");

    setUsers((prevUsers) =>
      prevUsers.map((user) => (user._id === userId ? { ...user, role: newRole } : user))
    );

    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message);
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === userId ? { ...user, role: user.role } : user))
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("An error occurred. Please try again.");
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? { ...user, role: user.role } : user))
      );
    }
  };

  const openModal = (user) => {
    setEditUser({
      id: user._id,
      email: user.email,
      role: user.role,
      major: user.major || "",
      assignedDay: user.assignedDay || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setEditUser({
      ...editUser,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log(updatedUser);
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
        );
        closeModal();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (loading) return <LoadingSpinner loading='users' />; // Add loading spinner
 // Add error handling

  return (
    <div className="admin-container">
      <div style={{display : "flex", justifyContent : "space-between", marginBottom : "1rem"}}>
      <h1>Registered Users</h1>
      <div  className="add-user-link">
                <Link to="/dashboard/adduser" >Add User <FaPlus size={15} ></FaPlus></Link>
       </div>       
       </div>
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {error && <div className="error">Error: {error}</div>}
      {users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          <tr>
          
            </tr>
            {users
              .filter((user) =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </td>
                  <td>
                    <button className="edit-button" onClick={() => openModal(user)}>Edit</button>
                    <button className="delete-button" onClick={() => deleteUser(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p>No registered users found.</p>
      )}

      {isModalOpen && (
        <div className="custom-modal">
          <div className="modal-content">
            <h2>Edit User</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editUser.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role:</label>
                <select
                  id="role"
                  name="role"
                  value={editUser.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="guide">Guide</option>
                  <option value="advisor">Advisor</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {(editUser.role === "guide" || editUser.role === "advisor") && (
                <div className="form-group">
                  <label htmlFor="major">Major:</label>
                  <select
                    id="major"
                    name="major"
                    value={editUser.major}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a major</option>
                    {majors.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((major) => (
                          <option key={major} value={major}>
                            {major}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
              {editUser.role === "advisor" && (
                <div className="form-group">
                  <label htmlFor="assignedDay">Assigned Day:</label>
                  <select
                    id="assignedDay"
                    name="assignedDay"
                    value={editUser.assignedDay}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              )}
              <button type="submit">Save Changes</button>
              <button type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

