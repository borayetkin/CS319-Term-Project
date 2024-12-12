import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TourApplication.css";
import CustomDateTimePicker from "../components/SchoolTourDatePicker";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

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

const TourApplication = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    tourType: "",
    contactPerson: "",
    email: "",
    visitDate: "",
    visitTime: "",
    city: "",
    district: "",
    studentCount: "",
    schoolName: "",
    additionalNotes: "",
    studentHighSchool: "",
    phoneNumber: "",
    majorOfInterest: "",
    schoolID: "",
    schoolProirity: "",
    reserveDates: [],
  });
  const [message, setMessage] = useState("");
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const emailTimeoutRef = useRef(null);
  const [phoneError, setPhoneError] = useState("");
  const [isTypingPhone, setIsTypingPhone] = useState(false);
  const phoneTimeoutRef = useRef(null);
  const dateTimeTimeoutRef = useRef(null);
  // Fetch schools from backend on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/high-schools");
        const data = await response.json();
        setSchools(data);
      } catch (error) {
        console.error("Error fetching high schools:", error);
      }
    };
    fetchSchools();
  }, []);

  // Filter schools by city and district
  useEffect(() => {
    if (formData.city && formData.district) {
      const filtered = schools.filter(
        (school) =>
          school.City === formData.city && school.District === formData.district
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [formData.city, formData.district, schools]);

  const isValidEmail = (email) => {
    // Basic email regex pattern
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };
  const hasEnteredDateAndTime = (date, time) => {
    return date !== "" && time !== "";
  };
  const isValidPhone = (phone) => {
    // Regex for Turkish phone number format: 0XXXXXXXXXX (11 digits)
    const phonePattern = /^0\d{10}$/;
    return phonePattern.test(phone.replace(/\D/g, "")); // Remove non-digits before testing
  };

  // Format phone number as user types (0XXX XXX XXXX)
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "";
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(
      7,
      11
    )}`;
  };

  const handleChange = (e) => {
    if (e.target.name === "email") {
      const email = e.target.value;
      setFormData({ ...formData, email: email });
      setIsTyping(true);

      // Clear any existing timeout
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }

      // Set new timeout to validate email after user stops typing
      emailTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (email && !isValidEmail(email)) {
          setEmailError("Please enter a valid email address");
        } else {
          setEmailError("");
        }
      }, 1000); // Wait 1 second after user stops typing
    } else if (e.target.name === "phoneNumber") {
      const phone = e.target.value;
      const formattedPhone = formatPhoneNumber(phone);
      setFormData({ ...formData, phoneNumber: formattedPhone });
      setIsTypingPhone(true);

      if (phoneTimeoutRef.current) {
        clearTimeout(phoneTimeoutRef.current);
      }

      phoneTimeoutRef.current = setTimeout(() => {
        setIsTypingPhone(false);
        const digitsOnly = phone.replace(/\D/g, "");
        if (digitsOnly && !isValidPhone(digitsOnly)) {
          setPhoneError("Please enter a valid phone number");
        } else {
          setPhoneError("");
        }
      }, 1000);
    } else if (e.target.name === "combinedDateTimeUpdate") {
      const { visitDate, visitTime, reserveDates } = e.target.value;

      setFormData({
        ...formData,
        visitDate: visitDate,
        visitTime: visitTime,
        reserveDates: reserveDates,
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setMessage("");
      setStep(step + 1);
    } else {
      setMessage("Please fill in all required fields");
      const messageElement = document.getElementById("message");
      if (messageElement) {
        messageElement.focus();
      }
    }
  };

  const handlePreviousStep = () => {
    setMessage("");
    setStep(step - 1);
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        return formData.tourType;
      case 1:
        return formData.contactPerson && formData.email && formData.phoneNumber;
      case 2:
        return formData.visitDate && formData.visitTime;
      case 3:
        return (
          formData.city &&
          formData.district &&
          ((formData.tourType === "individual" && formData.studentHighSchool) ||
            (formData.studentCount && formData.schoolName))
        );
      default:
        return true;
    }
  };

  // Clean up the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
      if (phoneTimeoutRef.current) {
        clearTimeout(phoneTimeoutRef.current);
      }
      if (dateTimeTimeoutRef.current) {
        clearTimeout(dateTimeTimeoutRef.current);
      }
    };
  }, []);

  const handleTourTypeSelection = (e) => {
    setFormData({ ...formData, tourType: e.target.value });
    setStep(1);
  };
  const findSchool = (schoolName, city, district) => {
    const school = schools.find(
      (school) =>
        school.SchoolName === schoolName &&
        school.City === city &&
        school.District === district
    );
    return school;
  };
  const handleSchoolSelection = (e) => {
    const schoolName = e.target.value;
    const school = findSchool(schoolName, formData.city, formData.district);
    const schoolID = school.id;
    const proirity = school.Priority;
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      schoolID,
      schoolProirity: proirity,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitButton = document.getElementById("submitButton");
    if (submitButton) {
      //submitButton.setAttribute("disabled", "true");
      submitButton.style.cursor = "not-allowed";
      submitButton.style.pointerEvents = "none";
      submitButton.style.backgroundColor = "gray";
      submitButton.disabled = true;
    }

    // Final email validation before submission
    // Add a delay of 2 seconds before final submission

    if (!isValidEmail(formData.email)) {
      setEmailError("Please enter a valid email address");
      submitButton.disabled = false;
      setStep(1);
      return;
    }

    if (!isValidPhone(formData.phoneNumber.replace(/\D/g, ""))) {
      setPhoneError(
        "Please enter a valid phone number starting with 0 (11 digits)"
      );
      submitButton.disabled = false;
      setStep(1);
      return;
    }
    if (!hasEnteredDateAndTime(formData.visitDate, formData.visitTime)) {
      setMessage("Please enter date and time");
      const messageElement = document.getElementById("message");
      if (messageElement) {
        messageElement.focus();
      }
      setStep(2);
      submitButton.disabled = false;
      return;
    }
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
            visitTime: formData.visitTime,
            studentName: formData.contactPerson,
            studentHighSchool: formData.studentHighSchool,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            city: formData.city,
            additionalNotes: formData.additionalNotes,
            majorOfInterest: formData.majorOfInterest,
            typeStr: "Individual Tour",
          };
    try {
      const response2 = await fetch(`http://localhost:3000/api/applicants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          tourType === "school"
            ? JSON.stringify({
                name: formData.schoolName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                priority: formData.schoolProirity,
                schoolID: formData.schoolID,
              })
            : JSON.stringify({
                name: formData.contactPerson,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
              }),
      });

      const data = await response2.json();

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicant: data._id,
          ...requestData,
        }),
      });
      const data2 = await response.json();

      if (response.ok && response2.ok) {
        setMessage("Tour application submitted successfully!");
      } else {
        setMessage("Error: " + data2.message);
        setStep(1);
        submitButton.disabled = false;
        const messageElement = document.getElementById("message");
        if (messageElement) {
          messageElement.focus();
        }
      }
    } catch (error) {
      setStep(1);
      submitButton.disabled = false;
      setMessage("An error occurred. Please try again.");
      const messageElement = document.getElementById("message");
      if (messageElement) {
        messageElement.focus();
      }
      return;
    }
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
    <section className="tour-application-section">
      <div className="tour-application-container">
        <h1>Submit a Tour Application</h1>
        {message && (
          <p className="tour-application-message" id="message" tabIndex="0">
            {message}
          </p>
        )}

        {step === 0 && (
          <p className="tour-application-description">
            Bilkent Üniversitesi’ni daha yakından tanımak isteyen eğitim
            kurumların ve bireysel ziyaretçilerin kampüs ziyaret talepleri için
            aşağıdaki formu doldurarak başvuruda bulunmalarını rica ederiz.
            Kampüs turları planlarımız çerçevesinde size e-posta ile geri dönüş
            yapılacaktır.
          </p>
        )}
        <div className="step-indicator">
          {step !== 0 && <p>Step {step} of 4</p>}

          {step === 1 && <p>Contact Information</p>}
          {step === 2 && <p>Select Date and Time</p>}
          {step === 3 && <p>Provide School Information</p>}
          {step === 4 && <p>Confirm Your Details</p>}
        </div>
        <form onSubmit={handleSubmit} className={`tour-application-form `}>
          {step === 0 && (
            <div
              className={`tour-type-selection ${
                step === 0 ? "step-enter" : "step-exit"
              }`}
            >
              <button
                type="button"
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
                type="button"
                onClick={handleTourTypeSelection}
                value="individual"
                className="tour-type-button"
              >
                Individual Tour
              </button>
              <p className="tour-type-description">
                Visit planned individually.
              </p>
            </div>
          )}
          {step === 1 && (
            <>
              <div className={step === 1 ? "step-enter" : "step-exit"}>
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
                  {emailError && !isTyping && (
                    <span className="error-message">{emailError}</span>
                  )}
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
                  {phoneError && !isTypingPhone && (
                    <span className="error-message">{phoneError}</span>
                  )}
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className={step === 2 ? "step-enter" : "step-exit"}>
                {formData.tourType === "individual" ? (
                  <>
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
                    <select
                      id="visitTime"
                      name="visitTime"
                      value={formData.visitTime}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a time</option>
                      {generateTimeSlots().map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <CustomDateTimePicker
                    handleChange={handleChange}
                    reserveDatesImp={formData.reserveDates}
                  />
                )}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className={step === 3 ? "step-enter" : "step-exit"}>
                <label htmlFor="city">City:</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a city</option>
                  {[...new Set(schools.map((school) => school.City))].map(
                    (city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    )
                  )}
                </select>
                <label htmlFor="district">District:</label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a district</option>
                  {[
                    ...new Set(
                      schools
                        .filter((school) => school.City === formData.city)
                        .map((school) => school.District)
                    ),
                  ].map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <label htmlFor="schoolName">
                  {formData.tourType === "individual"
                    ? "High School:"
                    : "School Name:"}
                </label>
                <select
                  id={
                    formData.tourType === "individual"
                      ? "studentHighSchool"
                      : "schoolName"
                  }
                  name={
                    formData.tourType === "individual"
                      ? "studentHighSchool"
                      : "schoolName"
                  }
                  value={
                    formData.tourType === "individual"
                      ? formData.studentHighSchool
                      : formData.schoolName
                  }
                  onChange={handleSchoolSelection}
                  required
                >
                  <option value="">Select a school</option>
                  {filteredSchools.map((school, index) => (
                    <option
                      key={`${school.SchoolName}-${school.District}-${index}`}
                      value={school.SchoolName}
                    >
                      {school.SchoolName}
                    </option>
                  ))}
                </select>
                {formData.tourType === "school" && (
                  <>
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
                )}
                {formData.tourType === "individual" && (
                  <>
                    <label htmlFor="majorOfInterest">Major of Interest:</label>
                    <select
                      id="majorOfInterest"
                      name="majorOfInterest"
                      value={formData.majorOfInterest}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a major</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Engineering">
                        Electrical Engineering
                      </option>
                      <option value="Mechanical Engineering">
                        Mechanical Engineering
                      </option>
                      <option value="Civil Engineering">
                        Civil Engineering
                      </option>
                      <option value="Business Administration">
                        Business Administration
                      </option>
                      <option value="Economics">Economics</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Architecture">Architecture</option>
                    </select>
                  </>
                )}
                <label htmlFor="additionalNotes">Additional Notes</label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                ></textarea>
              </div>
            </>
          )}
          {step === 4 && (
            <div
              className={`confirmation-step   ${
                step === 4 ? "step-enter" : "step-exit"
              }`}
            >
              <h2>Confirm Your Details</h2>
              <p>
                <strong>Tour Type:</strong> {formData.tourType}
              </p>
              <p>
                <strong>Contact Person:</strong> {formData.contactPerson}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Phone Number:</strong> {formData.phoneNumber}
              </p>
              <p>
                <strong>Visit Date:</strong> {formData.visitDate}
              </p>
              {formData.tourType === "school" &&
                formData.reserveDates.map((date) => (
                  <p style={{ color: "gray" }}>
                    {" "}
                    Reserve Visit Date And Time :{date.date} {date.time}
                  </p>
                ))}
              <p>
                <strong>Visit Time:</strong> {formData.visitTime}
              </p>
              <p>
                <strong>City:</strong> {formData.city}
              </p>
              <p>
                <strong>District:</strong> {formData.district}
              </p>
              {formData.tourType === "school" && (
                <>
                  <p>
                    <strong>School Name:</strong> {formData.schoolName}
                  </p>
                  <p>
                    <strong>Number of Students:</strong> {formData.studentCount}
                  </p>
                </>
              )}
              {formData.tourType === "individual" && (
                <>
                  <p>
                    <strong>High School:</strong> {formData.studentHighSchool}
                  </p>
                  <p>
                    <strong>Major of Interest:</strong>{" "}
                    {formData.majorOfInterest}
                  </p>
                </>
              )}
              <p>
                <strong>Additional Notes:</strong> {formData.additionalNotes}
              </p>
            </div>
          )}
          <div className="form-navigation">
            {step > 0 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="navigation-button"
              >
                <FaArrowLeft />
              </button>
            )}
            {step < 4 && step > 0 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="navigation-button"
              >
                <FaArrowRight />
              </button>
            )}
            {step === 4 && (
              <button
                type="submit"
                className="tour-application-submit"
                id="submitButton"
              >
                Submit Application
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default TourApplication;
