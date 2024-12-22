import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/EditApplication.module.css";
import LoadingSpinner from "../components/LoadingSpinner";

const EditApplication = () => {
  const { referenceCode } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const city = queryParams.get("city");
        const district = queryParams.get("district");
        const schoolName = queryParams.get("schoolName");

        const response = await fetch(
          `http://localhost:3000/api/events/reference/${referenceCode}?city=${city}&district=${district}&schoolName=${schoolName}`
        );
        const data = await response.json();
        if (response.ok) {
          setEvent(data);
        } else {
          setMessage("Invalid reference code or event not found.");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        setMessage("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [referenceCode, location.search]);
  let resubmissionLink = "";
  if(event){
    resubmissionLink = `http://localhost:5173/resubmit-form/${event._id}`;
  }
  const handleCancelEvent = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/events/cancel/${event._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setMessage("Event canceled successfully.");
        navigate("/");
      } else {
        setMessage(data.message || "Failed to cancel event.");
      }
    } catch (error) {
      console.error("Error canceling event:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const confirmCancelEvent = () => {
    handleCancelEvent();
    closeModal();
  };

  if (loading) {
    return <LoadingSpinner loading="event details" />;
  }

  return (
    <section className={styles.editApplicationSection}>
      <div className={styles.editApplicationContainer}>
        <h1 className={styles.title}>Edit Your Application</h1>
        {message && <p className={styles.errorMessage}>{message}</p>}
        {event && (
          <div className={styles.eventDetails}>
            <p><strong>Reference Code:</strong> {event.referenceCode}</p>
            <p><strong>City:</strong> {event.city}</p>
            <p><strong>District:</strong> {event.district}</p>
            <p><strong>School Name:</strong> {event.schoolName || event.studentHighSchool}</p>
            <p><strong>Visit Date:</strong> {new Date(event.visitDate).toLocaleDateString()}</p>
            <p><strong>Visit Time:</strong> {event.visitTime}</p>
            <p><strong>Status:</strong> {event.status}</p>
          </div>
        )}
        {event && (event.status === "pending" || event.status === "scheduled") && (
          <div className={styles.cancelSection}>
            <div className={styles.buttonContainer}>
              <a
                href={resubmissionLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resubmitLink}
              >
                Resubmit Date
              </a>
              <button onClick={openModal} className={styles.cancelButton}>
                Cancel Event
              </button>
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalHeader}>Reason for Cancellation</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={styles.modalTextarea}
            ></textarea>
            <button onClick={confirmCancelEvent} className={styles.modalButton}>
              Confirm
            </button>
            <button onClick={closeModal} className={styles.modalCancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default EditApplication;