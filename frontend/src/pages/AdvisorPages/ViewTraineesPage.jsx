import React, { useState, useEffect } from "react";
import { FiSearch, FiCheck, FiCalendar } from "react-icons/fi";
import styles from "../../styles/AdvisorPages/ViewTraineesPage.module.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import DatePicker2 from "../../components/DatePicker2";

const ViewTraineesPage = () => {
  const [trainees, setTrainees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("applications");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");

  useEffect(() => {
    fetchTrainees();
  }, [view]);

  const fetchTrainees = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = view === "applications" ? "applications" : "accepted";
      const response = await fetch(
        `http://localhost:3000/api/trainees-${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response);
      if (!response.ok) throw new Error("Failed to fetch trainees");
      const data = await response.json();
      setTrainees(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  const validateDateInput = (date) => {
    if (!date) return;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return date.match(dateRegex);
  };
  const handleAssignInterview = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/trainees/${selectedTrainee}/assign-interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ interviewDate }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign interview date");
      fetchTrainees();
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTrainees = trainees.filter(
    (trainee) =>
      trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainee.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner loading="trainees" />;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.viewTraineesPageContainer}>
      <h1>View Trainees</h1>

      <div className={styles.controlsContainer}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search trainees by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.viewToggle}>
          <button
            onClick={() => setView("applications")}
            className={view === "applications" ? styles.active : ""}
          >
            Applications
          </button>
          <button
            onClick={() => setView("accepted")}
            className={view === "accepted" ? styles.active : ""}
          >
            Accepted Trainees
          </button>
        </div>
      </div>

      {filteredTrainees.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>School ID</th>
              <th>Status</th>
              <th>Application Date</th>
              {view === "applications" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTrainees.map((trainee) => (
              <tr key={trainee._id}>
                <td>{trainee.name}</td>
                <td>{trainee.email}</td>
                <td>{trainee.phoneNumber}</td>
                <td>{trainee.department}</td>
                <td>{trainee.schoolID}</td>
                <td>{trainee.currentTraineeship.status}</td>
                <td>
                  {new Date(
                    trainee.currentTraineeship.applicationDate
                  ).toLocaleDateString()}
                </td>
                {view === "applications" && (
                  <td>
                    <div className={styles.actionButtons}>
                      {trainee.currentTraineeship.status === "pending" && (
                        <button
                          className={`${styles.actionButton} ${styles.assignInterview}`}
                          onClick={() => {
                            setSelectedTrainee(trainee._id);
                            setShowModal(true);
                          }}
                          title="Assign Interview Date"
                        >
                          <FiCalendar size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.noResults}>
          <p>No trainees found matching your criteria.</p>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Select Interview Date</h2>
            <DatePicker2
              onDateChange={(e) => setInterviewDate(e.target.value)}
              size="small"
            />
            <div className={styles.modalActions}>
              <button onClick={handleAssignInterview}>Assign</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTraineesPage;
