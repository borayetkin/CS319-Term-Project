import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "../styles/Home.css";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tours, setTours] = useState([]);
  const [sortOption, setSortOption] = useState("visitDate"); // State for sorting option

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

  // Sorting function
  const sortTours = (tours, option) => {
    return [...tours].sort((a, b) => {
      if (option === "schoolName") {
        return a.schoolName.localeCompare(b.schoolName);
      } else if (option === "visitDate") {
        return new Date(a.visitDate) - new Date(b.visitDate);
      } else if (option === "studentCount") {
        return b.studentCount - a.studentCount;
      }
      return 0;
    });
  };

  // Handle sorting option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Sorted tours based on the selected option
  const sortedTours = sortTours(tours, sortOption);

  return (
    <div>
      {isLoggedIn ? (
        <div className="tour-applications">
          <h1>Current Tour Applications</h1>

          {/* Sorting Dropdown */}
          <div className="sort-options">
            <label htmlFor="sort">Sort by:</label>
            <select id="sort" value={sortOption} onChange={handleSortChange}>
              <option value="visitDate">Visit Date</option>
              <option value="schoolName">School Name</option>
              <option value="studentCount">Student Count</option>
            </select>
          </div>

          {tours.length > 0 ? (
          <ul className="tour-list">
            {sortedTours.map((tour) => (
              <li key={tour._id} className="tour-item">
                <div className="tour-card">
                  <div className="tour-info">
                    <h3 className="tour-school-name">{tour.schoolName}</h3>
                    <div className="tour-details">
                      <p>
                        <strong>Contact Person:</strong> {tour.contactPerson}
                      </p>
                      <p>
                        <strong>Email:</strong> {tour.email}
                      </p>
                      <p>
                        <strong>Visit Date:</strong>{" "}
                        {new Date(tour.visitDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Student Count:</strong> {tour.studentCount}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
  </ul>
) : (
  <p className="no-tours-message">No tour applications found.</p>
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