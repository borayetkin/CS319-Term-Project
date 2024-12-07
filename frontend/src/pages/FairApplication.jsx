import React, { useState } from "react";
import "../styles/FairApplication.css";

const FairApplication = () => {
  const [formData, setFormData] = useState({
    applicantName: "",
    schoolName: "",
    city: "",
    visitDate: "",
    fairTime: "",
    location: "",
    email: "",
    phoneNumber: "",
    additionalNotes: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { applicantName, ...fairData } = formData; // Extract applicantName
    const dateTime = new Date(`${formData.visitDate}T${formData.fairTime}`);

    const applicantData = {
      name: formData.applicantName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    };

    const fairRequestData = {
        ...fairData,
        applicant: {
          applicantID: "some_generated_id", // Replace with your applicant ID logic
          name: applicantName
        },
        email: formData.email, // Include email
        phoneNumber: formData.phoneNumber, // Include phone number
      };

    try {
      // Step 1: Create or find the applicant
      const applicantResponse = await fetch(
        "http://localhost:3000/api/applicants",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicantData),
        }
      );

      const applicant = await applicantResponse.json();

      if (!applicantResponse.ok) {
        setMessage(`Error: ${applicant.message}`);
        return;
      }

      // Step 2: Create the fair invitation with the applicant info
      fairRequestData.applicant = {
        applicantID: applicant._id,
        name: applicant.name,
      };

      const fairResponse = await fetch(
        "http://localhost:3000/api/events/fairs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fairRequestData),
        }
      );

      const fairData = await fairResponse.json();

      if (fairResponse.ok) {
        setMessage("Fair application submitted successfully!");
      } else {
        setMessage(`Error: ${fairData.message}`);
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
          <label htmlFor="applicantName">Applicant Name:</label>
          <input
            type="text"
            id="applicantName"
            name="applicantName"
            value={formData.applicantName}
            onChange={handleChange}
            required
            placeholder="Enter your name or organization"
          />

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

          <label htmlFor="visitDate">Fair Date:</label>
          <input
            type="date"
            id="visitDate"
            name="visitDate"
            value={formData.visitDate}
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
