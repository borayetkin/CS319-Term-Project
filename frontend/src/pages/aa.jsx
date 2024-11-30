import React, { useState, useEffect } from "react";
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
    district: "",
    schoolName: "",
    studentCount: "",
    additionalNotes: "",
    studentHighSchool: "",
    phoneNumber: "",
    majorOfInterest: "",
  });
  const [message, setMessage] = useState("");
  const [schoolData, setSchoolData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    // Fetch school data from backend
    const fetchSchoolData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/high-schools");
        const data = await response.json();
        setSchoolData(data);
      } catch (error) {
        console.error("Error fetching school data:", error);
      }
    };

    fetchSchoolData();
  }, []);

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setFormData({
      ...formData,
      city: selectedCity,
      district: "",
      schoolName: "",
      studentHighSchool: "",
    });
    const filteredDistricts = [
      ...new Set(
        schoolData
          .filter((school) => school.City === selectedCity)
          .map((school) => school.District)
      ),
    ];
    setDistricts(filteredDistricts);
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setFormData({
      ...formData,
      district: selectedDistrict,
      schoolName: "",
      studentHighSchool: "",
    });
    const filteredSchools = schoolData.filter(
      (school) => school.District === selectedDistrict
    );
    setSchools(filteredSchools);
  };

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
          applicant: { applicantID: data._id, name: data.name },
          ...requestData,
        }),
      });
      const data2 = await response.json();

      if (response.ok && response2.ok) {
        setMessage("Tour application submitted successfully!");
      } else {
        setMessage("Error: " + data2.message);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <section className="tour-application-section">
      <div className="tour-application-container">
        <h1>Submit a Tour Application</h1>
        {message && <p className="tour-application-message">{message}</p>}

        <p className="tour-application-description">
          Bilkent Üniversitesi’ni daha yakından tanımak isteyen eğitim
          kurumların ve bireysel ziyaretçilerin kampüs ziyaret talepleri için
          aşağıdaki formu doldurarak başvuruda bulunmalarını rica ederiz. Kampüs
          turları planlarımız çerçevesinde size e-posta ile geri dönüş
          yapılacaktır.
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
              placeholder="example@example.com"
            />

            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="0 5XX XXX XX XX"
              pattern="05\d{9}"
              title="Please enter a valid Turkish phone number (e.g., 0 5XX XXX XX XX)"
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
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleCityChange}
              required
            >
              <option value="">Select a city</option>
              {[...new Set(schoolData.map((school) => school.City))].map(
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
              onChange={handleDistrictChange}
              required
            >
              <option value="">Select a district</option>
              {districts.map((district) => (
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
              onChange={handleChange}
              required
            >
              <option value="">Select a school</option>
              {schools.map((school) => (
                <option key={school.SchoolName} value={school.SchoolName}>
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
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">
                    Business Administration
                  </option>
                  <option value="Economics">Economics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Architecture">Architecture</option>
                </select>
              </>
            )}

            <label htmlFor="additionalNotes">Additional Notes:</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
            />

            <button type="submit" className="tour-application-submit">
              Submit Application
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default TourApplication;
