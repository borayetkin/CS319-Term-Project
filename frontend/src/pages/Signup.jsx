import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "guide", // Default role
    assignedDay: "",
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
    <div className="signup-container">
      {/* Background layer */}
      <div className="signup-background">
        <div className="signup-text">
          <div className="atom-group">
            <div className="title-line">SIGN UP TO</div>
            <div className="atom-line">
              <div className="atom-text">AT</div>
              <div className="atom-container">
                <div className="nucleus"></div>
                <div className="orbital orbital-1">
                  <div className="block"></div>
                </div>
                <div className="orbital orbital-2">
                  <div className="block"></div>
                </div>
                <div className="orbital orbital-3">
                  <div className="block"></div>
                </div>
              </div>
              <div className="atom-text">M</div>
            </div>
            <div className="subtitle-text">Advanced Tanıtım Ofisi Manager</div>
          </div>
        </div>
      </div>

      {/* Overlay signup box */}
      <div className="signup-overlay">
        <div className="signup-box">
          <h2>Sign Up</h2>
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
              className="signup-input"
              required
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="signup-input"
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="signup-input"
              required
            />

            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="signup-input"
              required
            >
              <option value="guide">Guide</option>
              <option value="coordinator">Coordinator</option>
              <option value="advisor">Advisor</option>
            </select>

            {formData.role === "advisor" && (
              <div className="form-group">
                <label htmlFor="assignedDay">Assigned Day:</label>
                <select
                  id="assignedDay"
                  name="assignedDay"
                  value={formData.assignedDay}
                  onChange={handleChange}
                  className="signup-input"
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

            <button type="submit" className="signup-button">Sign Up</button>
          </form>

          <div className="signup-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="login-link">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
