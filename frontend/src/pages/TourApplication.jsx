import React, { useState } from "react";
import "../styles/TourApplication.css"; // Import the CSS for styling

const TourApplication = () => {
  const [step, setStep] = useState(1); // Step 1 for tour type selection, Step 2 for form fields
  const [formData, setFormData] = useState({
    tourType: "", // Store selected tour type
    contactPerson: "", // Will be used as studentName for individual tours
    email: "",
    visitDate: "",
    visitTime: "",
    city: "",
    studentCount: "",
    additionalNotes: "",
    studentHighSchool: "", // Only for Individual Tour
    phoneNumber: "", // For applicant connection
  });
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle tour type selection
  const handleTourTypeSelection = (e) => {
    setFormData({ ...formData, tourType: e.target.value });
    setStep(2); // Proceed to the next step to display relevant fields
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { tourType, ...tourData } = formData;
    const endpoint = tourType === "school"
      ? "/api/events/schooltours"
      : "/api/events/individualtours";

    // Format the date and time properly
    const dateTime = new Date(`${formData.visitDate}T${formData.visitTime}`);

    const requestData = tourType === "school" ? {
      ...tourData,
      visitDate: dateTime,
      typeStr: "School Tour",
    } : {
      visitDate: dateTime,
      studentName: formData.contactPerson, // Use contact person as student name
      studentHighSchool: formData.studentHighSchool,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      city: formData.city,
      additionalNotes: formData.additionalNotes,
      typeStr: "Individual Tour",
    };

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
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

      {step === 1 ? (
        // Step 1: Tour Type Selection
        <div className="tour-type-selection">
          <label>Select Tour Type:</label>
          <button onClick={handleTourTypeSelection} value="school">
            School Tour
          </button>
          <button onClick={handleTourTypeSelection} value="individual">
            Individual Tour
          </button>
        </div>
      ) : (
        // Step 2: Form Fields
        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <label htmlFor="contactPerson">
            {formData.tourType === "individual" ? "Student Name:" : "Contact Person:"}
          </label>
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

          <label htmlFor="visitTime">Visit Time:</label>
          <input
            type="time"
            id="visitTime"
            name="visitTime"
            value={formData.visitTime}
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


          {formData.tourType === "school" ? (
            // Fields specific to School Tour
            <>
              <label htmlFor="schoolName">School Name:</label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
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
            </>
          ) : (
            // Fields specific to Individual Tour
            <>
              <label htmlFor="studentHighSchool">High School:</label>
              <input
                type="text"
                id="studentHighSchool"
                name="studentHighSchool"
                value={formData.studentHighSchool}
                onChange={handleChange}
                required
              />
            </>
          )}

          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <button type="submit">Submit Application</button>
        </form>
      )}
    </div>
  );
};

export default TourApplication;