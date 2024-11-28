import React, { useState } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "guide", // Default role
    assignedDay : ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        // Store token in localStorage or sessionStorage
        localStorage.setItem("token", data.token);
        setSuccess(data.message);
        window.location.href = "/"; // Redirect to homepage after signup
      } else {
        setError(data.message); // Display error message from server
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("An error occurred during signup.");
    }
  };

  return (
    <div className="container">
      <h1>Sign Up</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="role">Role:</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="guide">Guide</option>
          <option value="coordinator">Coordinator</option>
          <option value="advisor">Advisor</option>
        </select>
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
          </div>)}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
