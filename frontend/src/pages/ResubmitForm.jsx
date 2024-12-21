import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomDateTimePicker from "../components/SchoolTourDatePicker";
import "../styles/ResubmitForm.css";

const ResubmitForm = () => {
  const { eventId } = useParams(); // Extract eventId from URL
  const navigate = useNavigate(); // For navigation
  const [typeStr, setTypeStr] = useState(""); // Type of the tour
  const [reserveDates, setReserveDates] = useState([]); // Store reserve dates for group tours
  const [individualDate, setIndividualDate] = useState(""); // Selected date for individual tours
  const [individualTime, setIndividualTime] = useState(""); // Selected time for individual tours
  const [error, setError] = useState(""); // Store error messages
  const [isSubmitting, setIsSubmitting] = useState(false); // Show submission state
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch event details on component mount
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`);
        if (response.ok) {
          const eventData = await response.json();
          setTypeStr(eventData.__t); // Set the typeStr ("Individual Tour" or "School Tour")
          console.log(typeStr);
        } else {
          throw new Error("Unable to fetch event details.");
        }
      } catch (error) {
        setError("Failed to load event details. Please try again later.");
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const generateTimeSlots = () => {
    const startTime = new Date();
    startTime.setHours(8, 30, 0, 0);
    const endTime = new Date();
    endTime.setHours(16, 30, 0, 0);

    const timeSlots = [];
    while (startTime <= endTime) {
      const hours = startTime.getHours().toString().padStart(2, "0");
      const minutes = startTime.getMinutes().toString().padStart(2, "0");
      timeSlots.push(`${hours}:${minutes}`);
      startTime.setMinutes(startTime.getMinutes() + 30);
    }

    return timeSlots;
  };

  const handleReserveDatesChange = ({ target }) => {
    const dates = target.value;
    const updatedDates = dates.reserveDates;
    const formattedDates = updatedDates.map(({ date, time }) => ({
      visitDate: date,
      visitTime: time,
    }));
    setReserveDates(formattedDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs based on tour type
    if (typeStr === "SchoolTour" && reserveDates.length === 0) {
      setError("Please select at least one date and time.");
      return;
    }

    if (
      typeStr === "Individual Tour" &&
      (!individualDate || !individualTime)
    ) {
      setError("Please select a valid date and time for your individual tour.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const payload =
      typeStr === "SchoolTour"
        ? { reserveDates }
        : { visitDate: individualDate, visitTime: individualTime };

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/resubmit-form/${eventId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reserveDates }),
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setSuccessMessage("Your submission was successful!");
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
        <p className="success-note">
          Please wait for us to contact you to inform you about the status of your submission.
        </p>
        <button onClick={() => navigate("/")} className="success-button">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="resubmit-form-container">
      <h1>Resubmit Dates</h1>
      {error && <p className="error-message">{error}</p>}
      {!typeStr ? (
        <p>Loading event details...</p>
      ) : (
        <form onSubmit={handleSubmit} className="resubmit-form">
          {typeStr === "SchoolTour" ? (
        <div className="form-group">
          <label htmlFor="date-picker">Select Dates:</label>
          <CustomDateTimePicker
            handleChange={handleReserveDatesChange}
            reserveDatesImp={reserveDates}
          />
        </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="individualDate">Visit Date:</label>
                <input
                  type="date"
                  id="individualDate"
                  value={individualDate}
                  onChange={(e) => setIndividualDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="individualTime">Visit Time:</label>
                <select
                  id="individualTime"
                  value={individualTime}
                  onChange={(e) => setIndividualTime(e.target.value)}
                  required
                >
                  <option value="">Select a time</option>
                  {generateTimeSlots().map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={
              isSubmitting ||
              (typeStr === "SchoolTour" && reserveDates.length === 0)
            }
          >
            {isSubmitting ? "Submitting..." : "Resubmit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResubmitForm;
