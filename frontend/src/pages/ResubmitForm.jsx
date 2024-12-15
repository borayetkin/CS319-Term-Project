import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomDateTimePicker from "../components/SchoolTourDatePicker";
import "../styles/ResubmitForm.css";

const generateTimeSlots = () => {
  const start = new Date();
  start.setHours(8, 30, 0, 0); // Start time: 8:30 AM
  const end = new Date();
  end.setHours(17, 0, 0, 0); // End time: 5:00 PM

  const slots = [];
  while (start < end) {
    const hours = start.getHours();
    const minutes = start.getMinutes();
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    slots.push(timeString);
    start.setMinutes(start.getMinutes() + 30); // Increment by 30 minutes
  }

  return slots;
};

const ResubmitForm = () => {
  const { eventId } = useParams(); // Extract eventId from URL
  const navigate = useNavigate(); // For navigation
  const [reserveDates, setReserveDates] = useState([]); // Store reserve dates
  const [error, setError] = useState(""); // Store error messages
  const [isSubmitting, setIsSubmitting] = useState(false); // Show submission state
  const [successMessage, setSuccessMessage] = useState("");

  const handleReserveDatesChange = ({target}) => {
   const dates = target.value;
   const updatedDates = dates.reserveDates;
   console.log(updatedDates);
    // Update reserve dates from the date picker
    const formattedDates = updatedDates.map(({ visitDate, visitTime }) => ({
      visitDate,
      visitTime,
    }));

    setReserveDates(formattedDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (reserveDates.length === 0) {
      setError("Please select at least one date and time.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/resubmission/${eventId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reserveDates }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Your submission was successful!");
        setTimeout(() => navigate("/"), 2000); // Redirect after success
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error resubmitting dates. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while resubmitting dates. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="success-container">
        <h1>{successMessage}</h1>
        <button onClick={() => navigate("/")} className="success-button">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="resubmit-form-container">
      <h1>Resubmit Dates</h1>
      <form onSubmit={handleSubmit} className="resubmit-form">
        <div className="form-group">
          <label htmlFor="date-picker">Select Dates:</label>
          <CustomDateTimePicker
            handleChange={handleReserveDatesChange}
            reserveDatesImp={reserveDates} // Provide current reserveDates as initial data// Pass generated time slots
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Resubmit"}
        </button>
      </form>
    </div>
  );
};

export default ResubmitForm;
