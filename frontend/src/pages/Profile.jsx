import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaCalendarAlt, FaClock, FaEdit, FaSave } from 'react-icons/fa';
import { MdWork, MdSchool, MdLocationOn, MdLanguage } from 'react-icons/md';
import '../styles/Profile.css';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    phone: ''
  });
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setEditForm({
        email: data.email,
        phone: data.phone || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setUpdateMessage('');
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/update-contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: editForm.email,
          phone: editForm.phone
        }),
      });
      const updatedProfile = await response.json();
      const data = await response.json();
      setProfile(updatedProfile);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update contact info');
      }
      setTimeout(() => {
        setProfile(data);
        setIsEditing(false);
        setUpdateMessage('Contact information updated successfully!');
        setError(err.message);
      }, 3000);
    } catch (err) {
      setError(err.message);
      setUpdateMessage('');
    }
  };

  if (loading) return <LoadingSpinner loading='profile'/>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profile) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser size={40} />
        </div>
        <h1>{profile.name}</h1>
        <div className="profile-badge">{profile.role}</div>
      </div>

      {updateMessage && (
        <div className="update-message success">
          {updateMessage}
        </div>
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
                <h3>Phone</h3>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="edit-actions">
              <button type="submit" className="save-button">
                <FaSave /> Save Changes
              </button>
              <button type="button" onClick={handleEditToggle} className="cancel-button">
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
                <h3>Phone</h3>
                <p>{profile.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">
                <MdSchool />
              </div>
              <div className="card-content">
                <h3>Department</h3>
                <p>{profile.department || 'Not specified'}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">
                <FaGraduationCap />
              </div>
              <div className="card-content">
                <h3>Year</h3>
                <p>{profile.year ? `${profile.year}th year` : 'Not specified'}</p>
              </div>
            </div>

            <button onClick={handleEditToggle} className="edit-button">
              <FaEdit /> Edit Contact Info
            </button>
          </>
        )}
      </div>

      <div className="guide-info-section">
        <h2>Guide Information</h2>
        <div className="profile-grid">
          <div className="info-card">
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <div className="card-content">
              <h3>Available Days</h3>
              <p>{profile.availableDays?.join(', ') || 'Not set'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <FaClock />
            </div>
            <div className="card-content">
              <h3>Preferred Hours</h3>
              <p>{profile.preferredHours || 'Not set'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <MdLanguage />
            </div>
            <div className="card-content">
              <h3>Languages</h3>
              <p>{profile.languages?.join(', ') || 'Not specified'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <MdWork />
            </div>
            <div className="card-content">
              <h3>Tours Completed</h3>
              <p>{profile.toursCompleted || '0'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
