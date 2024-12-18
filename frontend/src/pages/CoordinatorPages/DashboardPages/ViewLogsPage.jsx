import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../../styles/CoordinatorPages/ViewLogsPage.module.css";
import LoadingSpinner from "../../../components/LoadingSpinner";

const ViewLogsPage = () => {
  
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");
  useEffect(() => {
    
    const fetchLogs = async () => {
        setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/logs", {
          params: { action: filter },
            headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(response.data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
        setIsLoading(false);
    };

    fetchLogs();
  }, [filter]);
  const formatActionName = (action) => {
    return action.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
  }
  return (
    <div className={styles.logsContainer}>
      <h2>View Logs</h2>
      <div className={styles.filterContainer}>
        <label htmlFor="action-filter">Filter by Action:</label>
        <select
          id="action-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="assignGuideToEvent">Guide Assignment</option>
          <option value="assignGuideToEventByOther">Guide Assignment By Another</option>
          <option value="removeAssignedGuideFromEvent">Guide Assignment Removal</option>

          {/* Add more action types as needed */}
        </select>
      </div>
      <table className={styles.logsTable}>
        <thead>
          <tr>
            <th>Actor</th>
            <th>Role</th>
            <th>Action</th>

            <th>Status</th>
            <th>Comment</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        {isLoading ? <LoadingSpinner loading="logs" />:
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
                <td>{log.userId.name}</td>
              <td>{log.role}</td>
              <td>{formatActionName(log.action)}</td>
              <td>{log.details.status}</td>
              <td>{log.details.comment}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>}
      </table>
    </div>
  );
};

export default ViewLogsPage;
