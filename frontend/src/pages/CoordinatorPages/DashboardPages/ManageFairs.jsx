import React, { useEffect, useState } from "react";

const ManageFairs = () => {
  const [fairs, setFairs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFairs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log("Fetching fairs..."); // Debug log
        const response = await fetch("http://localhost:3000/api/events/fairs", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status); // Debug log
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched fairs:", data); // Debug log
        setFairs(data);
      } catch (error) {
        console.error("Fetch error details:", error); // Debug log
        setError(`Error fetching fairs: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFairs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <h1>Fairs</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Fairs</h1>
      {fairs.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>School Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Location</th>
              <th>Fair Time</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fairs.map((fair) => (
              <tr key={fair._id}>
                <td>{fair.schoolName}</td>
                <td>{fair.email}</td>
                <td>{fair.phoneNumber}</td>
                <td>{fair.location}</td>
                <td>{fair.fairTime}</td>
                <td>{fair.city}</td>
                <td>{fair.status}</td>
                <td>
                  {fair.status === "pending" && (
                    <>
                      <button onClick={() => handleAccept(fair._id)}>Accept</button>
                      <button onClick={() => handleDecline(fair._id)}>Decline</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No fairs found.</p>
      )}
    </div>
  );
};

export default ManageFairs;