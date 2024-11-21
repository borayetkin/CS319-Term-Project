import React, { useState } from "react";
import "../../../styles/CoordinatorPages/AddUser.css"

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // default role
    assignedDay: "", // for advisors
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "user",
          assignedDay: "",
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error during adding user:", error);
      setError("An error occurred while adding the user.");
    }
  };

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="user">User</option>
            <option value="advisor">Advisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {formData.role === "advisor" && (
          <div className="form-group">
            <label htmlFor="assignedDay">Assigned Day:</label>
            <input
              type="text"
              id="assignedDay"
              name="assignedDay"
              value={formData.assignedDay}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUser;