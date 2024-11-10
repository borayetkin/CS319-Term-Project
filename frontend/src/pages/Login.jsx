import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../styles/Login.css"; // Add the custom CSS file



const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
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
        window.location.href = "/"; // Redirect to homepage after login
      } else {
        setError(data.message); // Display error message from server
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1 className="login-title">Log Into</h1>
        <h2 className="login-logo">ATOM</h2>
        <p className="login-subtitle">Advanced Tanıtım Ofisi Manager</p>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Login</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="login-input"
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              required
            />

            <div className="login-remember">
              <label>
                <input type="checkbox" /> Remember Me
              </label>
              <a href="#" className="login-forgot">
                Forget Password?
              </a>
            </div>

            <button type="submit" className="login-button">Log in</button>
          </form>

          {/* Signup link section */}
          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;