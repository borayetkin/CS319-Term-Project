import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../styles/Login.css"; // Add the custom CSS file

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: null,
    password: null,
    general: null
  });

  // Improved mouse tracking animation
  // ... previous imports and component definition ...

useEffect(() => {
  const atomContainer = document.querySelector('.atom-container');
  const loginBackground = document.querySelector('.login-background');
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let animationFrameId;
  let isDragging = false;

  // Get the atom's natural position in the layout
  const atomRect = atomContainer.getBoundingClientRect();
  const initialX = atomRect.left;
  const initialY = atomRect.top;

  // Reset the atom's position to its natural state
  atomContainer.style.transform = 'translate(0, 0)';

  const lerp = (start, end, factor) => start + (end - start) * factor;

  const animate = () => {
    currentX = lerp(currentX, targetX, 0.1);
    currentY = lerp(currentY, targetY, 0.1);
    
    atomContainer.style.transform = `translate(${currentX - initialX}px, ${currentY - initialY}px)`;
    animationFrameId = requestAnimationFrame(animate);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = loginBackground.getBoundingClientRect();
    targetX = e.clientX - (atomContainer.offsetWidth / 2);
    targetY = e.clientY - (atomContainer.offsetHeight / 2);
    
    if (!animationFrameId) {
      animate();
    }
    atomContainer.classList.add('moving');
  };

  const handleMouseDown = () => {
    isDragging = true;
    atomContainer.classList.add('moving');
  };

  const handleMouseUp = () => {
    isDragging = false;
    // Return to the natural position
    targetX = initialX;
    targetY = initialY;
    atomContainer.classList.remove('moving');
  };

  if (loginBackground && atomContainer) {
    loginBackground.addEventListener('mousemove', handleMouseMove);
    atomContainer.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
  }

  return () => {
    if (loginBackground) {
      loginBackground.removeEventListener('mousemove', handleMouseMove);
    }
    if (atomContainer) {
      atomContainer.removeEventListener('mousedown', handleMouseDown);
    }
    window.removeEventListener('mouseup', handleMouseUp);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}, []);

useEffect(() => {
  // Add class when component mounts
  document.body.classList.add('login-page');
  
  // Remove class when component unmounts
  return () => {
    document.body.classList.remove('login-page');
  };
}, []);

// ... rest of the component ...

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous errors
    setErrors({
      email: null,
      password: null,
      general: null
    });

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
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      } else {
        // Handle specific error cases
        switch (data.type) {
          case 'email':
            setErrors(prev => ({ ...prev, email: data.message }));
            break;
          case 'password':
            setErrors(prev => ({ ...prev, password: data.message }));
            break;
          default:
            setErrors(prev => ({ ...prev, general: data.message }));
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors(prev => ({ ...prev, general: "An error occurred during login." }));
    }
  };

  return (
    <div className="login-container">
      {/* Background layer */}
      <div className="login-background">
        <div className="login-text">
          <div className="atom-group">
            <div className="title-line">LOG INTO</div>
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

      {/* Overlay login box */}
      <div className="login-overlay">
        <div className="login-box">
          <h2>Login</h2>
          {errors.general && <p style={{ color: "red" }}>{errors.general}</p>}
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
            {errors.email && <p style={{ color: "red", fontSize: "0.8em" }}>{errors.email}</p>}

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
            {errors.password && <p style={{ color: "red", fontSize: "0.8em" }}>{errors.password}</p>}

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