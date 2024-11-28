import React, { useState, useEffect } from "react";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    assignedDay: "" // Add userType to the state
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
            assignedDay : data.assignedDay ? data.assignedDay : ""
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
          assignedDay: formData.assignedDay ? formData.assignedDay : "" // Only send updatable fields
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
    <div className="container">
      <h1>Profile</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {message && (
            <p style={{ color: message.includes("error") ? "red" : "green" }}>
              {message}
            </p>
          )}
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
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
          />

          { formData.userType === "advisor" && (<>
            <label htmlFor="assignedDay">Assigned Day:</label>
          <input
            type="text"
            id="assignedDay"
            name="assignedDay"
            value={formData.assignedDay}
            onChange={handleChange}
            required
          /></>)}

          <label htmlFor="userType">User Type:</label>
          <input
            type="text"
            id="userType"
            name="userType"
            value={formData.userType} // Display userType
            readOnly // Make the field read-only
          />

          <button type="submit">Update Profile</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
