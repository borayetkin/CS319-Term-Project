import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../styles/Login.css"; // Add the custom CSS file

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);

  // Add mouse tracking animation
  useEffect(() => {
    const atomContainer = document.querySelector('.atom-container');
    const loginLeft = document.querySelector('.login-left');
    let rafId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const lerp = (start, end, factor) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      currentX = lerp(currentX, targetX, 0.1);
      currentY = lerp(currentY, targetY, 0.1);
      
      if (atomContainer) {
        atomContainer.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) 
                                       rotate3d(${-currentY * 0.01}, ${currentX * 0.01}, 0, ${Math.sqrt(currentX * currentX + currentY * currentY) * 0.05}deg)`;
      }
      
      rafId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = loginLeft.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      targetX = x * 0.15;
      targetY = y * 0.15;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    if (loginLeft && atomContainer) {
      loginLeft.addEventListener('mousemove', handleMouseMove);
      loginLeft.addEventListener('mouseleave', handleMouseLeave);
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      if (loginLeft) {
        loginLeft.removeEventListener('mousemove', handleMouseMove);
        loginLeft.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(rafId);
    };
  }, []);

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
        <div className="atom-container">
          <div className="nucleus"></div>
          <div className="orbital orbital-1">
            <a className="block" style={{"--index": "0", "--bg": "var(--gradient-1)"}} tabIndex="0">
              <span className="block__item">A</span>
            </a>
          </div>
          <div className="orbital orbital-2">
            <a className="block" style={{"--index": "1", "--bg": "var(--gradient-3)"}} tabIndex="0">
              <span className="block__item">T</span>
            </a>
          </div>
          <div className="orbital orbital-3">
            <a className="block" style={{"--index": "2", "--bg": "var(--gradient-5)"}} tabIndex="0">
              <span className="block__item">O</span>
            </a>
          </div>
          <div className="orbital orbital-4">
            <a className="block" style={{"--index": "3", "--bg": "var(--gradient-7)"}} tabIndex="0">
              <span className="block__item">M</span>
            </a>
          </div>
        </div>
        
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