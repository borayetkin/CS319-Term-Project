import React from "react";
import PropTypes from "prop-types";
import { FaSave, FaTimes } from "react-icons/fa";
import "../styles/AvailabilityEditor.css";

const timeSlots = ["09:00-11:00", "11:00-12:30", "13:30-15:00", "16:00-17:30"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AvailabilityEditor = ({ availability, onAvailabilityChange, onSubmit, onCancel, isSubmitting }) => {
  return (
    <div className="availability-editor">
      <h2>Edit Availability</h2>
      <form onSubmit={onSubmit} className="availability-form">
        {daysOfWeek.map((day) => (
          <div key={day} className="availability-day">
            <h3>{day}</h3>
            <div className="time-slots">
              {timeSlots.map((timeSlot) => (
                <button key={timeSlot} className={(availability.find((d) => d.day === day)?.timeSlots.includes(timeSlot) || false) ?" available" : "not-available" } type="button"
                onClick={() => onAvailabilityChange(day, timeSlot)}>
                  
                  {timeSlot}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="edit-actions">
          <button type="submit" className="save-button" disabled={isSubmitting}>
            <FaSave /> Save Availability
          </button>
          <button type="button" onClick={onCancel} className="cancel-button" disabled={isSubmitting}>
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};



export default AvailabilityEditor;
