import React, { useState, useRef, useEffect } from "react";
import "../styles/FairApplication.css";

const FairApplication = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    city: "",
    fairDate: "",
    fairTime: "",
    location: "",
    email: "",
    phoneNumber: "",
    additionalNotes: "",
    requiredNumberOfGuides: 2, // Default value
    hoursOfWork: 3, // Default value
  });

  // Add validation states
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingPhone, setIsTypingPhone] = useState(false);
  const emailTimeoutRef = useRef(null);
  const phoneTimeoutRef = useRef(null);
  const [message, setMessage] = useState("");

  // Validation functions
  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const isValidPhone = (phone) => {
    const phonePattern = /^0\d{10}$/;
    return phonePattern.test(phone.replace(/\D/g, ''));
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 11)}`;
  };

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
      if (phoneTimeoutRef.current) clearTimeout(phoneTimeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setFormData({ ...formData, email: value });
      setIsTyping(true);
      
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
      
      emailTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (value && !isValidEmail(value)) {
          setEmailError("Please enter a valid email address");
        } else {
          setEmailError("");
        }
      }, 1000);
    } else if (name === 'phoneNumber') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({ ...formData, phoneNumber: formattedPhone });
      setIsTypingPhone(true);
      
      if (phoneTimeoutRef.current) {
        clearTimeout(phoneTimeoutRef.current);
      }
      
      phoneTimeoutRef.current = setTimeout(() => {
        setIsTypingPhone(false);
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly && !isValidPhone(digitsOnly)) {
          setPhoneError("Please enter a valid phone number");
        } else {
          setPhoneError("");
        }
      }, 1000);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fairRequestData = {
      ...formData,
      fairDate: new Date(formData.fairDate).toISOString(), // Ensure proper date formatting
    };

    try {
      const response = await fetch("http://localhost:3000/api/fairs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fairRequestData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Fair application submitted successfully!");
        setFormData({
          schoolName: "",
          city: "",
          fairTime: "",
          fairDate: "",
          location: "",
          email: "",
          phoneNumber: "",
          additionalNotes: "",
        });
      } else {
        setMessage(`Error: ${data.message}`);
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

          <label htmlFor="fairDate">Fair Date:</label>
          <input
            type="date"
            id="fairDate"
            name="fairDate"
            value={formData.fairDate}
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

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@example.com"
              className={emailError && !isTyping ? "error" : ""}
            />
            {emailError && !isTyping && <span className="error-message">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="0XXX XXX XXXX"
              className={phoneError && !isTypingPhone ? "error" : ""}
              maxLength="13"
            />
            {phoneError && !isTypingPhone && <span className="error-message">{phoneError}</span>}
          </div>

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
