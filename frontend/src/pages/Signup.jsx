import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Signup.css";
import { majors } from "./TourApplication.jsx"; // Adjust the import path as necessary

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    major: "",
    year: "",
    role: "guide", // Default role
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

            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="signup-input"
              required
            />

            <label htmlFor="major">Major:</label>
            <select
              id="major"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="signup-input"
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

            <label htmlFor="year">Year:</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="signup-input"
              required
            >
              <option value="">Select a year</option>
              <option value="1">1st year</option>
              <option value="2">2nd year</option>
              <option value="3">3rd year</option>
              <option value="4">4th year</option>
            </select>

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
