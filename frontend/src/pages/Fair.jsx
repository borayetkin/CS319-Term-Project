import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/Fair.css";


const Fair = () => {
  const { id } = useParams();
  const [fair, setFair] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const personIconUrl = "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

  useEffect(() => {
    const fetchFair = async (token) => {
      try {
        const response = await fetch(`http://localhost:3000/api/fairs/fair/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch fair");
        }
        const fairData = await response.json();
        setFair(fairData);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchFair(token);
    } else {
      window.location.href = "/";
    }
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="fair-container">
      <h1>{fair.schoolName}</h1>
      <p>Date: {new Date(fair.fairDate).toLocaleDateString()}</p>
      <p>Time: {fair.fairTime}</p>
      <p>Location: {fair.city }</p>
      <p>address: {fair.location }</p>
      <p>Organizer: {fair.organiserName}</p>
      <p>Status: {fair.status}</p>
    </div>
  );
};

export default Fair;
