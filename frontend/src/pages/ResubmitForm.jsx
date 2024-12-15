import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomDateTimePicker from "../components/SchoolTourDatePicker";
import "../styles/ResubmitForm.css";

const ResubmitForm = () => {
  const [formData, setFormData] = useState({
    combinedDateTimeUpdate: {
      visitDate: "",
      visitTime: "",
      reserveDates: [],
    },
  });
  const [message, setMessage] = useState(null); // For success message
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setMessage("Tour application submitted successfully!");
    }, 500);
  };

  if (message === "Tour application submitted successfully!") {
    return (
      <section className="tour-application-section">
        <div className="tour-application-container">
          <h1>{message}</h1>
          <button
            onClick={() => navigate("/")}
            className="tour-application-submit"
          >
            Return Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="resubmit-form-container">
      <h1>Resubmit Form</h1>
      <form onSubmit={handleSubmit} className="resubmit-form">
        <label htmlFor="date-picker">
          Select Dates:
          <CustomDateTimePicker
            handleChange={handleInputChange}
            reserveDatesImp={formData.combinedDateTimeUpdate.reserveDates}
          />
        </label>
        <button type="submit" className="submit-button">
          Resubmit
        </button>
      </form>
    </div>
  );
};

export default ResubmitForm;
