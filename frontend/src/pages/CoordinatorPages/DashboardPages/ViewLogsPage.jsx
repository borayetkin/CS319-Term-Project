import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../../styles/CoordinatorPages/ViewLogsPage.module.css";
import LoadingSpinner from "../../../components/LoadingSpinner";
import TablePagination from '@mui/material/TablePagination';

const ViewLogsPage = () => {
  
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const token = localStorage.getItem("token");
  useEffect(() => {
    setPage(0)
    const fetchLogs = async () => {
        setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/logs?limit=true", {
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
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);
  const formatActionName = (action) => {
    return action.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
  }
  
  const filteredLogs = logs.filter((log) =>
    log.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatActionName(log.action).toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(log.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className={styles.logsContainer}>
      <h2>View Logs</h2>
      <div className={styles.searchContainer}>
        <div className={styles.filterContainer}>
          <label htmlFor="action-filter">Filter by Action:</label>
          <select
            id="action-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="assignGuideToEvent">Guide Assignment</option>
            <option value="assignAdvisorToTour">Advisor Assignment</option>
            <option value="markEventAsCompleted">Event Completion</option>
            <option value="markEventAsCancelled">Event Cancellation</option>
            <option value="applyToEvent">Event Application</option>
            <option value="unapplyFromEvent">Event Application Removal</option>
          <option value="assignGuideToFair">Guide Assignment To Fair</option>
            <option value="assignGuideToEventByOther">Guide Assignment By Another</option>
            <option value="removeAssignedGuideFromEvent">Guide Assignment Removal</option>
            {/* Add more action types as needed */}
          </select>
        </div>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
        
        <tbody>
        <td colSpan={100}>{isLoading && <LoadingSpinner loading="logs" />}</td>
          {paginatedLogs.map((log) => (
            
            <tr key={log._id}>
                <td>{log.userId.name}</td>
              <td>{log.role}</td>
              <td>{formatActionName(log.action)}</td>
              <td>{log.details.status}</td>
              <td>{log.details.comment}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination
        component="div"
        count={filteredLogs.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default ViewLogsPage;
