import React, { useState, useEffect } from "react";
import '../styles/Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    assignedDay: "", // Add userType to the state
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Fetch the current user's profile information
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setFormData({
            name: data.name,
            email: data.email,
            userType: data.role,
            assignedDay: data.assignedDay ? data.assignedDay : "",
          }); // Include userType
        } else {
          console.error(data.message);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          assignedDay: formData.assignedDay ? formData.assignedDay : "", // Only send updatable fields
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Error updating profile: " + data.message);
      }
    } catch (error) {
      setMessage("An error occurred: " + error.message);
    }
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`message ${message.includes("error") ? "error" : "success"}`}>
              {message}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
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
            <label htmlFor="email">Email</label>
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
            <label htmlFor="userType">User Type</label>
            <input
              type="text"
              id="userType"
              name="userType"
              value={formData.userType}
              readOnly
            />
          </div>

          {formData.userType === "advisor" && (
            <div className="form-group">
              <label htmlFor="assignedDay">Assigned Day</label>
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

          <button type="submit" className="submit-button">
            Update Profile
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
