import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Card, CardContent, Typography, Pagination, Modal, Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from '../../styles/CoordinatorPages/ApplicantsPage.module.css';

const ApplicantsPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchInitialApplicants();
  }, []);

  const fetchInitialApplicants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/applicants?limit=30', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      data.sort((a, b) => b.events.length - a.events.length); // Sort by number of events
      setApplicants(data);
      setFilteredApplicants(data);
      setLoading(false);
      fetchRemainingApplicants();
    } catch (error) {
      console.error('Error fetching initial applicants:', error);
      setLoading(false);
    }
  };

  const fetchRemainingApplicants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/applicants?skip=30', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      data.sort((a, b) => b.events.length - a.events.length); // Sort by number of events
      setApplicants(prevApplicants => [...prevApplicants, ...data]);
      setFilteredApplicants(prevApplicants => [...prevApplicants, ...data]);
    } catch (error) {
      console.error('Error fetching remaining applicants:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterApplicants(e.target.value, filter);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    filterApplicants(searchTerm, e.target.value);
  };

  const filterApplicants = (searchTerm, filter) => {
    let filtered = applicants.filter(applicant =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filter === 'individual') {
      filtered = filtered.filter(applicant => applicant.schoolID === -1);
    } else if (filter === 'school') {
      filtered = filtered.filter(applicant => applicant.schoolID !== -1);
    }

    setFilteredApplicants(filtered);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCardClick = async (applicantId) => {
    setModalLoading(true);
    setModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/applicants/${applicantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log(data)
      setSelectedApplicant(data);
      setModalLoading(false);
    } catch (error) {
      console.error('Error fetching applicant details:', error);
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedApplicant(null);
  };

  const paginatedApplicants = filteredApplicants.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) {
    return <LoadingSpinner loading="applicants" />;
  }

  return (
    <div className={styles.applicantsPage}>
      <h1>Applicants</h1>
      <div className={styles.filters}>
        <TextField
          label="Search by name"
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchBar}
        />
        <Select
          value={filter}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="individual">Individuals</MenuItem>
          <MenuItem value="school">Schools</MenuItem>
        </Select>
      </div>
      <div className={styles.applicantsList}>
        {paginatedApplicants.map(applicant => (
          <Card key={applicant._id} className={styles.applicantCard} onClick={() => handleCardClick(applicant._id)}>
            <CardContent>
              <Typography variant="h5">{applicant.name}</Typography>
              <Typography>Email: {applicant.email}</Typography>
              <Typography>Phone: {applicant.phoneNumber}</Typography>
              {applicant.schoolID !== -1 && (
                <>
                  <Typography>School ID: {applicant.schoolID}</Typography>
                  <Typography>Priority: {applicant.priority}</Typography>
                </>
              )}
              <Typography>Number of Events: {applicant.events.length}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination
        count={Math.ceil(filteredApplicants.length / itemsPerPage)}
        page={page}
        onChange={handlePageChange}
        className={styles.pagination}
      />
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box className={styles.modalBox}>
          <IconButton className={styles.closeButton} onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
          {modalLoading ? (
            <LoadingSpinner loading="applicant details" />
          ) : (
            selectedApplicant && (
              <div className={styles.applicantDetails}>
                <Typography variant="h4">{selectedApplicant.name}</Typography>
                <Typography>Email: {selectedApplicant.email}</Typography>
                <Typography>Phone: {selectedApplicant.phoneNumber}</Typography>
                {selectedApplicant.schoolID !== -1 && (
                  <>
                    <Typography>School ID: {selectedApplicant.schoolID}</Typography>
                    <Typography>Priority: {selectedApplicant.priority}</Typography>
                  </>
                )}
                { selectedApplicant.events.length > 0 ?
                <>
                <Typography variant="h6">Events:</Typography>
                <ul className={styles.eventsList}>
                  {selectedApplicant.events.map(event => (
                    <li key={event._id} className={styles.eventItem}>
                      <Typography>Date: {new Date(event.visitDate).toLocaleDateString()}</Typography>
                      <Typography>Status: {event.status}</Typography>
                    </li>
                  ))}
                </ul>
                </>:
                 <Typography>No events Found</Typography>
                }
              </div>
            )
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default ApplicantsPage;
