import React, { useState } from "react";
import "../styles/FairApplication.css";

const FairApplication = () => {
  const [formData, setFormData] = useState({
    fairName: "",
    organizerName: "",
    email: "",
    phoneNumber: "",
    fairDate: "",
    city: "",
    additionalNotes: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/fairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("Fair invitation submitted successfully!");
      } else {
        setMessage("Error: " + data.message);
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

        <p className="fair-application-description">
          Please fill out the form below to invite Bilkent University to your fair.
          We will review your invitation and respond via email based on our availability.
        </p>

        <form onSubmit={handleSubmit} className="fair-application-form">
          <label htmlFor="fairName">Fair Name:</label>
          <input
            type="text"
            id="fairName"
            name="fairName"
            value={formData.fairName}
            onChange={handleChange}
            required
          />

          <label htmlFor="organizerName">Organizer Name:</label>
          <input
            type="text"
            id="organizerName"
            name="organizerName"
            value={formData.organizerName}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@example.com"
          />

          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="0 5XX XXX XX XX"
            pattern="05\d{9}"
            title="Please enter a valid Turkish phone number (e.g., 0 5XX XXX XX XX)"
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

          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <label htmlFor="additionalNotes">Additional Notes:</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
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