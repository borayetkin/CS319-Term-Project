import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ApplicationDetails = () => {
  const { id } = useParams(); // Extract the application ID from the URL
  const [application, setApplication] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setApplication(data);
        } else {
          const errorData = await response.json();
          setMessage(`Failed to fetch details: ${errorData.message}`);
        }
      } catch (error) {
        setMessage("Error fetching application details: " + error.message);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  if (!application) {
    return <p>{message || "Loading application details..."}</p>;
  }

  return (
    <div className="application-details-container">
      <h1>Application Details</h1>
      <p>
        <strong>Type:</strong>{" "}
        {application.__t === "SchoolTour" ? "School Tour" : "Individual Tour"}
      </p>
      <p>
        <strong>Status:</strong> {application.status}
      </p>
      <p>
        <strong>Visit Date:</strong>{" "}
        {new Date(application.visitDate).toLocaleDateString()}
      </p>
      <p>
        <strong>Visit Time:</strong> {application.visitTime || "N/A"}
      </p>
      {application.__t === "SchoolTour" ? (
        <>
          <p>
            <strong>School Name:</strong> {application.schoolName}
          </p>
          <p>
            <strong>City:</strong> {application.city}
          </p>
          <p>
            <strong>District:</strong> {application.district}
          </p>
          <p>
            <strong>Student Count:</strong> {application.studentCount}
          </p>
          <p>
            <strong>Contact Person:</strong> {application.contactPerson}
          </p>
          <p>
            <strong>Phone Number:</strong> {application.phoneNumber}
          </p>
          <p>
            <strong>Email:</strong> {application.email}
          </p>
        </>
      ) : (
        <>
          <p>
            <strong>Student Name:</strong> {application.studentName}
          </p>
          <p>
            <strong>Student High School:</strong>{" "}
            {application.studentHighSchool}
          </p>
          <p>
            <strong>City:</strong> {application.city}
          </p>
          <p>
            <strong>District:</strong> {application.district}
          </p>
          <p>
            <strong>Major of Interest:</strong> {application.majorOfInterest}
          </p>
          <p>
            <strong>Phone Number:</strong> {application.phoneNumber}
          </p>
          <p>
            <strong>Email:</strong> {application.email}
          </p>
        </>
      )}
      <p>
        <strong>Additional Notes:</strong>{" "}
        {application.additionalNotes || "N/A"}
      </p>
    </div>
  );
};

export default ApplicationDetails;
