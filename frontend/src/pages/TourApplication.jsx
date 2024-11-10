import React, { useState } from "react";

const TourApplication = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    contactPerson: "",
    email: "",
    visitDate: "",
    studentCount: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Tour application submitted successfully!");
      } else {
        setMessage("Error: " + data.message);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Submit a Tour Application</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="schoolName">School Name:</label>
        <input
          type="text"
          id="schoolName"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          required
        />

        <label htmlFor="contactPerson">Contact Person:</label>
        <input
          type="text"
          id="contactPerson"
          name="contactPerson"
          value={formData.contactPerson}
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
        />

        <label htmlFor="visitDate">Visit Date:</label>
        <input
          type="date"
          id="visitDate"
          name="visitDate"
          value={formData.visitDate}
          onChange={handleChange}
          required
        />

        <label htmlFor="studentCount">Number of Students:</label>
        <input
          type="number"
          id="studentCount"
          name="studentCount"
          value={formData.studentCount}
          onChange={handleChange}
          required
        />

        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
};

export default TourApplication;
