import React, { useState, useEffect } from "react";
import "../styles/TourApplication.css";
import { majors } from "./TourApplication.jsx"; // Adjust the import path as necessary


const TraineeshipApplication = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    schoolID: "",
    department: "",
    status: "pending",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [transition, setTransition] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/train/trainees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Application submitted successfully!");
        setFormData({
          name: "",
          phoneNumber: "",
          email: "",
          schoolID: "",
          department: "",
          status: "pending",
        });
        setTimeout(() => setSuccess(""), 3000); // Hide success message after 3 seconds
      } else {
        console.log(data.error);
        setSuccess("");
        setError(data.error);
        setTimeout(() => setError(""), 3000); // Hide error message after 3 seconds
      }
    } catch (error) {
      setSuccess("");
      setError("An error occurred while submitting the application.");
      setTimeout(() => setError(""), 3000); // Hide error message after 3 seconds

    }
  };

  const handleNextStep = () => {
    setTransition("step-exit");
    setTimeout(() => {
      setStep(step + 1);
      setTransition("step-enter");
    }, 500);
  };

  const handlePreviousStep = () => {
    setTransition("step-exit");
    setTimeout(() => {
      setStep(step - 1);
      setTransition("step-enter");
    }, 500);
  };

  return (
    <section className="tour-application-section">
      <div className={`tour-application-container ${transition}`}>
        {step === 1 && (
          <>
            <h1>Welcome to the Traineeship Application</h1>
            <p className="tour-application-description">
              At Atom, we believe in nurturing talent and providing opportunities for growth. Our traineeship program is designed to give you hands-on experience and help you develop the skills you need to succeed in your career.
            </p>
            <p className="tour-application-description">
              Our team is composed of experienced professionals who are passionate about mentoring and guiding new talent. We are committed to creating a supportive and inclusive environment where you can thrive.
            </p>
            <button onClick={handleNextStep} className="tour-application-submit">
              Next
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h1>Traineeship Application</h1>
            {success && <p className="success-message">{success}</p>}
            {error && <p style={{color : "crimson"}}>{error}</p>}
            <form className="tour-application-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="schoolID">Bilkent ID</label>
              <input
                type="number"
                id="schoolID"
                name="schoolID"
                value={formData.schoolID}
                onChange={handleChange}
                required
              />

              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select a department</option>
                {majors.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((major) => (
                      <option key={major} value={major}>
                        {major}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <div className="form-navigation">
                <button type="button" onClick={handlePreviousStep} className="navigation-button">
                  Previous
                </button>
                <button type="submit" className="tour-application-submit">
                  Submit Application
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default TraineeshipApplication;
