import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from '../styles/AdvisorInformation.module.css';
import LoadingSpinner from "../components/LoadingSpinner";


// Custom Modal Component
const CustomModal = ({ isOpen, onRequestClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onRequestClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const AdvisorInformation = () => {
  const [advisors, setAdvisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:3000/api/auth/advisor-info", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {setAdvisors(data); setIsLoading(false);})
      .catch((error) => console.error("Error fetching advisors:", error));
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const advisorId = queryParams.get("id");
    if (advisorId) {
      const advisor = advisors.find((advisor) => advisor._id === advisorId);
      setSelectedAdvisor(advisor);
    }
  }, [location.search, advisors]);

  const filteredAdvisors = advisors.filter((advisor) =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) || advisor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.advisorInfoContainer}>
      <h1>Advisor Information</h1>
      <input
        type="text"
        placeholder="Search advisors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
    {isLoading ? <LoadingSpinner />:(
      <table className={styles.advisorTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Assigned Day</th>
          </tr>
        </thead>
        
        <tbody>
          {filteredAdvisors.map((advisor) => (
            <tr key={advisor._id} onClick={() => setSelectedAdvisor(advisor)}>
              <td>{advisor.name}</td>
              <td>{advisor.email}</td>
              <td>{advisor.assignedDay}</td>
            </tr>
          ))}
        </tbody>
      </table>)}
      {selectedAdvisor && (
        <CustomModal
          isOpen={!!selectedAdvisor}
          onRequestClose={() => setSelectedAdvisor(null)}
        >
          <h2>{selectedAdvisor.name}</h2>
          <p>Email: {selectedAdvisor.email}</p>
          <p>Assigned Day: {selectedAdvisor.assignedDay}</p>
          <h3>Day Applications</h3>
          <table className={styles.dayApplicationsTable}>
            <thead>
              <tr>
                
                <th>Visit Date</th>
                <th>Visit Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              { selectedAdvisor.dayApplications && selectedAdvisor.dayApplications.map((application) => (
                <tr key={application._id}>
                  <td>{new Date(application.visitDate).toLocaleDateString()}</td>
                  <td>{application.visitTime}</td>
                  <td>{application.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setSelectedAdvisor(null)}>Close</button>
        </CustomModal>
      )}
    </div>
  );
};

export default AdvisorInformation;