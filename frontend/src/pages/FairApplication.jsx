import React, { useState } from "react";
import "../styles/FairApplication.css";

const FairApplication = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    city: "",
    fairDate: "",
    fairTime: "",
    location: "",
    email: "",
    phoneNumber: "",
    additionalNotes: "",
    requiredNumberOfGuides: 2, // Default value
    hoursOfWork: 3, // Default value
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fairRequestData = {
      ...formData,
      fairDate: new Date(formData.fairDate).toISOString(), // Ensure proper date formatting
    };

    try {
      const response = await fetch("http://localhost:3000/api/fairs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fairRequestData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Fair application submitted successfully!");
        setFormData({
          schoolName: "",
          city: "",
          fairTime: "",
          fairDate: "",
          location: "",
          email: "",
          phoneNumber: "",
          additionalNotes: "",
        });
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <section className="fair-application-section">
      <div className="fair-application-container">
        <h1>Submit a Fair Invitation</h1>
        {message && <p className="fair-application-message">{message}</p>}

        <form onSubmit={handleSubmit} className="fair-application-form">
          <label htmlFor="schoolName">School Name:</label>
          <input
            type="text"
            id="schoolName"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleChange}
            required
            placeholder="Enter the school name"
          />

          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="Enter the city"
          />

          <label htmlFor="fairDate">Fair Date:</label>
          <input
            type="date"
            id="fairDate"
            name="fairDate"
            value={formData.fairDate}
            onChange={handleChange}
            required
          />

          <label htmlFor="fairTime">Fair Time:</label>
          <input
            type="time"
            id="fairTime"
            name="fairTime"
            value={formData.fairTime}
            onChange={handleChange}
            required
          />

          <label htmlFor="location">Location (Detailed Address):</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Enter the detailed location"
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />

          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
          />

          <label htmlFor="additionalNotes">Additional Notes:</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Add any additional information"
          />

          <button type="submit" className="fair-application-submit">
            Submit Invitation
          </button>
        </form>
      </div>
    </section>
  );
};

export default FairApplication;
