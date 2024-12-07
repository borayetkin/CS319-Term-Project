import React, { useEffect, useState } from "react";
import "../../../styles/CoordinatorPages/SchoolPriorityPage.css";

const SchoolPriorityPage = () => {
  const [schools, setSchools] = useState([]); // State to store all high schools
  const [filteredSchools, setFilteredSchools] = useState([]); // State for filtered/sorted data
  const [error, setError] = useState(null); // State to store any errors
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [cityFilter, setCityFilter] = useState(""); // Filter by city
  const [districtFilter, setDistrictFilter] = useState(""); // Filter by district
  const [sortOption, setSortOption] = useState("SchoolName"); // Sorting option
  const [isUpdating, setIsUpdating] = useState(false); // State to change highschool priority 
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', schools: [] });

  const schoolsPerPage = 10;

  // Fetch the schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/high-schools");
        if (!response.ok) {
          throw new Error("Failed to fetch high schools.");
        }
        const data = await response.json(); // Parse JSON data
        setSchools(data); // Save the schools into state
        setFilteredSchools(data); // Initialize filteredSchools
      } catch (error) {
        setError(error.message); // Set error message
      }
    };

    fetchSchools();
  }, []);

  const handlePriorityChange = async (school, newPriority) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`http://localhost:3000/api/high-schools/${school.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...school,
          Priority: newPriority
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update school priority');
      }

      // Update local state while preserving the current sort order
      const updatedSchools = [...schools];
      const schoolIndex = updatedSchools.findIndex(s => s.id === school.id);
      updatedSchools[schoolIndex] = { ...school, Priority: newPriority };
      
      // Re-sort the updated schools array based on current sortOption
      updatedSchools.sort((a, b) => a[sortOption].localeCompare(b[sortOption]));
      
      setSchools(updatedSchools);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter, Search, and Sort Logic
  useEffect(() => {
    let updatedSchools = [...schools]; // Create a new array to avoid mutation

    // Apply search filter
    if (searchTerm) {
      updatedSchools = updatedSchools.filter(
        (school) =>
          school.SchoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.City.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.District.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply city filter
    if (cityFilter) {
      updatedSchools = updatedSchools.filter(
        (school) => school.City.toLowerCase() === cityFilter.toLowerCase()
      );
    }

    // Apply district filter
    if (districtFilter) {
      updatedSchools = updatedSchools.filter(
        (school) => school.District.toLowerCase() === districtFilter.toLowerCase()
      );
    }

    // Apply sorting - Updated to handle different data types
    updatedSchools.sort((a, b) => {
      const valueA = (a[sortOption] || '').toString().toLowerCase();
      const valueB = (b[sortOption] || '').toString().toLowerCase();
      return valueA.localeCompare(valueB);
    });

    setFilteredSchools(updatedSchools);
    setCurrentPage(1); // Reset to first page when filters/sort change
  }, [searchTerm, cityFilter, districtFilter, sortOption, schools]); // Make sure sortOption is in dependencies

  // Pagination Logic
  const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage);
  const displayedSchools = filteredSchools.slice(
    (currentPage - 1) * schoolsPerPage,
    currentPage * schoolsPerPage
  );

  // Add these new calculations
  const schoolStats = {
    general: schools.filter(s => s.Priority === "General").length,
    preferred: schools.filter(s => s.Priority === "High").length,
    focus: schools.filter(s => s.Priority === "Medium").length
  };

  const handleStatCardClick = (type) => {
    if (type === 'general') return; // Don't show modal for general schools
    
    const filteredSchools = schools.filter(s => 
      (type === 'preferred' && s.Priority === 'High') ||
      (type === 'focus' && s.Priority === 'Medium')
    );

    setModalContent({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Schools`,
      schools: filteredSchools.map(s => s.SchoolName).sort()
    });
    setShowModal(true);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#4CAF50" }}>High Schools List</h1>

      {/* Add Stats Cards */}
      <div className="stats-container">
        <div className="stat-card general">
          <div className="stat-icon">🏫</div>
          <div className="stat-details">
            <span className="stat-value">{schoolStats.general}</span>
            <span className="stat-label">General Schools</span>
          </div>
        </div>

        <div className="stat-card preferred" onClick={() => handleStatCardClick('preferred')}>
          <div className="stat-icon">⭐</div>
          <div className="stat-details">
            <span className="stat-value">{schoolStats.preferred}</span>
            <span className="stat-label">Preferred Schools</span>
          </div>
        </div>

        <div className="stat-card focus" onClick={() => handleStatCardClick('focus')}>
          <div className="stat-icon">🎯</div>
          <div className="stat-details">
            <span className="stat-value">{schoolStats.focus}</span>
            <span className="stat-label">Focus Schools</span>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalContent.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {modalContent.schools.length > 0 ? (
                <ul className="schools-list">
                  {modalContent.schools.map((school, index) => (
                    <li key={index}>{school}</li>
                  ))}
                </ul>
              ) : (
                <p>No schools found in this category.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search, Filters, and Sorting */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search by name, city, or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            flex: "1",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">All Cities</option>
          {[...new Set(schools.map((school) => school.City))].map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">All Districts</option>
          {[...new Set(schools.map((school) => school.District))].map((district, index) => (
            <option key={index} value={district}>
              {district}
            </option>
          ))}
        </select>
        <select
          value={sortOption}
          onChange={(e) => {
            setSortOption(e.target.value);
          }}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="SchoolName">Sort by Name</option>
          <option value="City">Sort by City</option>
          <option value="District">Sort by District</option>
          <option value="Priority">Sort by Priority</option>
        </select>
      </div>

      {/* Error Handling */}
      {error ? (
        <p style={{ color: "red", textAlign: "center" }}>Error: {error}</p>
      ) : filteredSchools.length > 0 ? (
        <>
          {/* Table Display */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>City</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>District</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Priority</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>School Name</th>
              </tr>
            </thead>
            <tbody>
      {displayedSchools.map((school, index) => (
        <tr key={index} style={{ textAlign: "left" }}>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>{school.City}</td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>{school.District}</td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            <select
              value={school.Priority}
              onChange={(e) => handlePriorityChange(school, e.target.value)}
              disabled={isUpdating}
              style={{
                padding: "4px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "100%"
              }}
            >
              <option value="General">General</option>
              <option value="High">Preferred</option>
              <option value="Medium">Focus</option>
            </select>
          </td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>{school.SchoolName}</td>
        </tr>
      ))}
    </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                borderRadius: "5px",
                backgroundColor: currentPage === 1 ? "#ccc" : "#4CAF50",
                color: "#fff",
                border: "none",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: "16px", marginRight: "10px" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                backgroundColor: currentPage === totalPages ? "#ccc" : "#4CAF50",
                color: "#fff",
                border: "none",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p style={{ textAlign: "center", color: "#555" }}>No schools available.</p>
      )}
    </div>
  );
};

export default SchoolPriorityPage;