import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { MdWork, MdSchool, MdLocationOn, MdLanguage } from "react-icons/md";
import "../styles/Profile.css";
import LoadingSpinner from "../components/LoadingSpinner";
import { majors } from "./TourApplication.jsx"; // Adjust the import path as necessary
import AvailabilityEditor from "../components/AvailabilityEditor";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    phoneNumber: "",
    major: "",
    password: "",
    assignedDay: "",
  });
  const [availability, setAvailability] = useState([]);
  const [updateMessage, setUpdateMessage] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfile(data);
      setEditForm({
        email: data.email,
        phoneNumber: data.phoneNumber || "",
        major: data.major || "",
        assignedDay: data.assignedDay || "",
        password: "",
      });
      setAvailability(data.availability || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setUpdateMessage("");
  };

  const handleAvailabilityEditToggle = () => {
    setIsEditingAvailability(!isEditingAvailability);
    setUpdateMessage("");
  };

  const handlePasswordEditToggle = () => {
    setIsEditingPassword(!isEditingPassword);
    setUpdateMessage("");
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvailabilityChange = (day, timeSlot) => {
    console.log(day, timeSlot);
    const updatedAvailability = [...availability];
    const dayIndex = updatedAvailability.findIndex((d) => d.day === day);
    console.log(dayIndex);
    if (dayIndex > -1) {
      const timeSlotIndex =
        updatedAvailability[dayIndex].timeSlots.indexOf(timeSlot);
      if (timeSlotIndex > -1) {
        updatedAvailability[dayIndex].timeSlots.splice(timeSlotIndex, 1);
        if (updatedAvailability[dayIndex].timeSlots.length === 0) {
          updatedAvailability.splice(dayIndex, 1);
        }
      } else {
        updatedAvailability[dayIndex].timeSlots.push(timeSlot);
      }
    } else {
      console.log("here");
      updatedAvailability.push({ day, timeSlots: [timeSlot] });
    }

    setAvailability(updatedAvailability);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/auth/update-contact",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editForm.email,
            phoneNumber: editForm.phoneNumber,
            major: editForm.major,
            assignedDay: editForm.assignedDay,
          }),
        }
      );
      const updatedProfile = await response.json();
      if (!response.ok) {
        throw new Error(
          updatedProfile.message || "Failed to update contact info"
        );
      }
      setProfile(updatedProfile);
      setUpdateMessage("Info updated successfully");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
      setTimeout(() => setUpdateMessage(""), 2000);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
      setUpdateMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/events/user/availability",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availability }),
        }
      );

      if (!response.ok) {
        throw new Error(
          updatedProfile.message || "Failed to update availability"
        );
      }

      setUpdateMessage("Availability updated successfully");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
      setTimeout(() => setUpdateMessage(""), 2000);
      setIsEditingAvailability(false);
    } catch (err) {
      setError(err.message);
      setUpdateMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/auth/update-contact",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: editForm.password,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update password");
      }
      setUpdateMessage("Password updated successfully");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
      setTimeout(() => setUpdateMessage(""), 2000);
      setIsEditingPassword(false);
    } catch (err) {
      setError(err.message);
      setUpdateMessage("");
    } finally {
      editForm.password = "";
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner loading="profile" />;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profile) return null;

  return (
    <div className="profile-container">
      {showSuccessPopup && (
        <div className="success-popup">Update successful!</div>
      )}
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser size={40} />
        </div>
        <h1>{profile.name}</h1>
        <div className="profile-badge">{profile.role}</div>
      </div>

      {updateMessage && (
        <div className="update-message success">{updateMessage}</div>
      )}

      <div className="profile-grid">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="info-card editable">
              <div className="card-icon">
                <FaEnvelope />
              </div>
              <div className="card-content">
                <h3>Email</h3>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="info-card editable">
              <div className="card-icon">
                <FaPhone />
              </div>
              <div className="card-content">
                <h3>Phone Number</h3>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {profile.role !== "admin" && profile.role != "coordinator" && (
              <div className="info-card editable">
                <div className="card-icon">
                  <MdSchool />
                </div>
                <div className="card-content">
                  <label htmlFor="major">Major:</label>
                  <select
                    id="major"
                    name="major"
                    value={editForm.major}
                    onChange={handleInputChange}
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
              </div>
            )}

            {profile.role === "advisor" && (
              <div className="info-card editable">
                <div className="card-icon">
                  <FaCalendarAlt />
                </div>
                <div className="card-content">
                  <h3>Assigned Day</h3>
                  <select
                    name="assignedDay"
                    value={editForm.assignedDay}
                    onChange={handleInputChange}
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
              </div>
            )}

            <div className="edit-actions">
              <button
                type="submit"
                className="save-button"
                disabled={isSubmitting}
              >
                <FaSave /> Save Changes
              </button>
              <button
                type="button"
                onClick={handleEditToggle}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : isEditingPassword ? (
          <form onSubmit={handlePasswordSubmit} className="edit-form">
            <div className="info-card editable">
              <div className="card-icon">
                <FaEdit />
              </div>
              <div className="card-content">
                <h3>Password</h3>
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div className="edit-actions">
              <button
                type="submit"
                className="save-button"
                disabled={isSubmitting}
              >
                <FaSave /> Save Password
              </button>
              <button
                type="button"
                onClick={handlePasswordEditToggle}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="info-card">
              <div className="card-icon">
                <FaEnvelope />
              </div>
              <div className="card-content">
                <h3>Email</h3>
                <p>{profile.email}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">
                <FaPhone />
              </div>
              <div className="card-content">
                <h3>Phone Number</h3>
                <p>{profile.phoneNumber || "Not provided"}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">
                <MdSchool />
              </div>
              <div className="card-content">
                <h3>Department</h3>
                <p>{profile.major || "Not specified"}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">
                <FaGraduationCap />
              </div>
              <div className="card-content">
                <h3>Year</h3>
                <p>
                  {profile.year ? `${profile.year}th year` : "Not specified"}
                </p>
              </div>
            </div>
            <div className="profile-edit-button-container">
              <button onClick={handleEditToggle} className="edit-button">
                <FaEdit /> Edit Profile
              </button>
              <button
                onClick={handlePasswordEditToggle}
                className="edit-button"
              >
                <FaEdit /> Change Password
              </button>
              {profile.role === "guide" && (
                <button
                  onClick={handleAvailabilityEditToggle}
                  className="edit-button"
                >
                  <FaEdit /> Edit Availability
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {isEditingAvailability && (
        <AvailabilityEditor
          availability={availability}
          onAvailabilityChange={handleAvailabilityChange}
          onSubmit={handleAvailabilitySubmit}
          onCancel={handleAvailabilityEditToggle}
          isSubmitting={isSubmitting}
        />
      )}

      <div className="guide-info-section">
        <h2>Guide Information</h2>
        <div className="profile-grid">
          <div className="info-card">
            <div className="card-content">
              <div className="card-icon">
                <h3>Preferred Time and Hours</h3> <FaCalendarAlt /> <FaClock />
              </div>
              {profile.availability?.length ? ( // Check if availability is set
                <ul>
                  {profile.availability.map((day) => (
                    <li key={day.day}>
                      <strong>{day.day}</strong>
                      <ul>
                        {day.timeSlots.map((timeSlot) => (
                          <li key={timeSlot}>{timeSlot}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Not set</p>
              )}
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <MdLanguage />
            </div>
            <div className="card-content">
              <h3>Languages</h3>
              <p>{profile.languages?.join(", ") || "Not specified"}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <MdWork />
            </div>
            <div className="card-content">
              <h3>Tours Completed</h3>
              <p>{profile.toursCompleted || "0"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
