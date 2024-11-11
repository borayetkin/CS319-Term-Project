import React, { useState } from "react";
import "../styles/TourApplication.css";

const TourApplication = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tourType: "",
    contactPerson: "",
    email: "",
    visitDate: "",
    visitTime: "",
    city: "",
    studentCount: "",
    additionalNotes: "",
    studentHighSchool: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTourTypeSelection = (e) => {
    setFormData({ ...formData, tourType: e.target.value });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tourType, ...tourData } = formData;
    const endpoint =
      tourType === "school"
        ? "/api/events/schooltours"
        : "/api/events/individualtours";
    const dateTime = new Date(`${formData.visitDate}T${formData.visitTime}`);

    const requestData =
      tourType === "school"
        ? {
            ...tourData,
            visitDate: dateTime,
            typeStr: "School Tour",
          }
        : {
            visitDate: dateTime,
            studentName: formData.contactPerson,
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
    <div className="tour-application-container">
      <h1>Submit a Tour Application</h1>
      {message && <p className="tour-application-message">{message}</p>}

      <p className="tour-application-description">
        Bilkent Üniversitesi’ni daha yakından tanımak isteyen eğitim
        kurumların ve bireysel ziyaretçilerin kampüs ziyaret talepleri için aşağıdaki formu doldurarak
        başvuruda bulunmalarını rica ederiz. Kampüs turları planlarımız
        çerçevesinde size e-posta ile geri dönüş yapılacaktır.
      </p>

      {step === 1 ? (
        <div className="tour-type-selection">
          <button
            onClick={handleTourTypeSelection}
            value="school"
            className="tour-type-button"
          >
            School Tour
          </button>
          <p className="tour-type-description">
            Visit organized by a school for groups of students.
          </p>

          <button
            onClick={handleTourTypeSelection}
            value="individual"
            className="tour-type-button"
          >
            Individual Tour
          </button>
          <p className="tour-type-description">Visit planned individually.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="tour-application-form">
          <label htmlFor="contactPerson">
            {formData.tourType === "individual"
              ? "Student Name:"
              : "Contact Person:"}
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

          <button type="submit" className="tour-application-submit">
            Submit Application
          </button>
        </form>
      )}
    </div>
  );
};

export default TourApplication;
