import React, { useState } from "react";
import "../../../styles/CoordinatorPages/AddUser.css"
import { majors } from "../../TourApplication.jsx"; // Adjust the import path as necessary


const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    major: "",
    year: "",
    role: "guide", // default role
    assignedDay: "", // for advisors
  });
  const [sendMail, setSendMail] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    
    return "1234";
  };
  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, email, phoneNumber, major, year, role, assignedDay } = formData;
    const phoneRegex = /^[0-9]{11}$/;
    if (!name || !email  || !phoneNumber || (role !== "coordinator" && (!major || !year))) {
      return "All fields must be filled.";
    }
    if (!phoneRegex.test(phoneNumber)) {
      return "Phone number must be 10 digits.";
    }
    if (role === "advisor" && !assignedDay) {
      return "Assigned day must be selected for advisors.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    } else{
      setError("");
    }

    try {
      const response = await fetch(`http://localhost:3000/api/auth/signup?sendEmail=${sendMail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({...formData , password: generateRandomPassword()}),
      });

      
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          major: "",
          year: "",
          role: "guide",
          assignedDay: "",
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error during adding user:", error);
      setError("An error occurred while adding the user.");
    }
  };

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
       
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="guide">Guide</option>
            <option value="advisor">Advisor</option>
            <option value="coordinator">Coordinator</option>
          </select>
        </div>
        {(formData.role === "guide" || formData.role === "advisor") && (
          <>
            <div className="form-group">
              <label htmlFor="major">Major:</label>
              <select
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                required
              >
                <option value="">Select a major</option>
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
            </div>
            <div className="form-group">
              <label htmlFor="year">Year:</label>
              <select id="year" name="year" value={formData.year} onChange={handleChange} required>
                <option value="">Select a year</option>
                <option value="1">1st year</option>
                <option value="2">2nd year</option>
                <option value="3">3rd year</option>
                <option value="4">4th year</option>
              </select>
            </div>
          </>
        )}
        {formData.role === "advisor" && (
          <div className="form-group">
            <label htmlFor="assignedDay">Assigned Day:</label>
            <select
              id="assignedDay"
              name="assignedDay"
              value={formData.assignedDay}
              onChange={handleChange}
              required
            >
              <option value="">Select a day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="sendMail">Send Email?</label>
          <input
            type="checkbox"
            id="sendMail"
            name="sendMail"
            value={sendMail}
            onChange={() => setSendMail(!sendMail)}
          />
        </div>
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUser;