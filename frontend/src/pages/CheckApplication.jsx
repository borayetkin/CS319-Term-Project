import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CheckApplication.module.css";

const CheckApplication = () => {
  const [referenceCode, setReferenceCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/high-schools");
        const data = await response.json();
        setSchools(data);
      } catch (error) {
        console.error("Error fetching high schools:", error);
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    if (city && district) {
      const filtered = schools.filter(
        (school) => school.City === city && school.District === district
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [city, district, schools]);

  const handleCheckApplication = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/api/events/reference/${referenceCode}?city=${city}&district=${district}&schoolName=${schoolName}`
      );
      const data = await response.json();

      if (response.ok) {
        navigate(`/edit-application/${referenceCode}?city=${city}&district=${district}&schoolName=${schoolName}`);
      } else {
        setMessage("Invalid reference code or school name.");
      }
    } catch (error) {
      console.error("Error checking application:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <section className={styles.checkApplicationSection}>
      <div className={styles.checkApplicationContainer}>
        <h1 className={styles.title}>Check Your Application</h1>
        {message && <p className={styles.errorMessage}>{message}</p>}
        <form onSubmit={handleCheckApplication} className={styles.form}>
          <label htmlFor="referenceCode" className={styles.label}>Reference Code:</label>
          <input
            type="text"
            id="referenceCode"
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            required
            className={styles.input}
          />
          <label htmlFor="city" className={styles.label}>City:</label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={styles.select}
          >
            <option value="">Select a city</option>
            {[...new Set(schools.map((school) => school.City))].map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <label htmlFor="district" className={styles.label}>District:</label>
          <select
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
            className={styles.select}
          >
            <option value="">Select a district</option>
            {[
              ...new Set(
                schools
                  .filter((school) => school.City === city)
                  .map((school) => school.District)
              ),
            ].map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <label htmlFor="schoolName" className={styles.label}>School Name:</label>
          <select
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
            className={styles.select}
          >
            <option value="">Select a school</option>
            {filteredSchools.map((school, index) => (
              <option
                key={`${school.SchoolName}-${school.District}-${index}`}
                value={school.SchoolName}
              >
                {school.SchoolName}
              </option>
            ))}
          </select>
          <button type="submit" className={styles.submitButton}>
            Check Application
          </button>
        </form>
      </div>
    </section>
  );
};

export default CheckApplication;
