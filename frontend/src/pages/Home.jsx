import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "../styles/Home.css";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchTourApplications(token); // Fetch tours if logged in
    }
  }, []);

  // Fetch tour applications from the backend
  const fetchTourApplications = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/tours", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTours(data);
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div className="tour-applications">
          <h1>Current Tour Applications</h1>
          {tours.length > 0 ? (
            <ul>
              {tours.map((tour) => (
                <li key={tour._id}>
                  <h3>{tour.schoolName}</h3>
                  <p>{tour.visitDate}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tour applications found.</p>
          )}
        </div>
      ) : (
        <div>
          <section className="welcome-section">
            <h1>Welcome to Bilkent Tours!</h1>
            <p>Book and explore guided tours for high schools.</p>
            <Link to="/tours" className="cta-button">
              Book a Tour
            </Link>
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
