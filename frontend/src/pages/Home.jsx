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
      if (response.status === 401) {
        // Unauthorized: clear local storage
        setIsLoggedIn(false);
        localStorage.clear();
      }else{
      setIsLoggedIn(true);
      const data = await response.json();
      setTours(data);}
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

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
            <table className="tour-table">
            <thead>
              <tr>
                <th>School Name</th>
                <th>Contact Person</th>
                <th>Date</th>
                <th>Time</th>
                <th>Number of Students</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
    <tbody>
    {sortedTours.map((tour) => (
        <tr key={tour._id}>
          <td>{tour.schoolName}</td>
          <td>{tour.contactPerson}</td>
          <td>{new Date(tour.visitDate).toLocaleDateString()}</td> {/* Format date */}
          <td>{new Date(tour.visitDate).toLocaleTimeString()}</td> {/* Format time */}
          <td>{tour.studentCount}</td>
          <td>{tour.email}</td>
          <td>{tour.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
        ) : (
        <p className="no-tours-message">No tour applications found.</p>
        )}
        
        </div>
        )  : (
        <div>
          <section className="home-welcome-section">
            <div className="home-text-container">
              <h1>Bilkent Üniversitesi Kampüs Ziyaretleri</h1>
              <p>
                Kampüs ziyaretiniz süresince üniversitenin eğitim programları
                hakkında rehber öğrencilerimizden bilgi alabilecek, kampüsün
                güzelliklerini ve olanaklarını yerinde görebileceksiniz.
              </p>
              <Link to="/tours" className="home-cta-button">
                Rezervasyon Yap
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
