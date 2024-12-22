import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdvisorPages/Applications.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import GeneralTable from "../../components/GeneralTable";
import ApplicationsRowActions from "../../components/ApplicationsRowActions";
import TypeSelectionTrio from "../../components/TypeSelectionTrio";
import { FaSearch } from 'react-icons/fa';
import DetailsModal from "../../components/DetailsModal";
import WeeklySchedules from "../../components/WeeklySchedules";
import AddEventModal from "../../components/AddEventModal";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);
  const [tourType, setTourType] = useState("SchoolTour");
  const [sortOption, setSortOption] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [messageTimeout, setMessageTimeout] = useState(null);
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false); // State to toggle views
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // Data passed to the modal
  const wrapperRef = useRef(null);
  const applicationsRef = useRef(null);
  const scheduleRef = useRef(null);

  const adjustHeights = () => {
    const activeContent = showWeeklySchedule ? scheduleRef.current : applicationsRef.current;
  
    if (wrapperRef.current && activeContent) {
      const newHeight = activeContent.offsetHeight;
  
      // Update the wrapper height only if it has changed
      if (wrapperRef.current.style.height !== `${newHeight}px`) {
        wrapperRef.current.style.height = `${newHeight}px`;
      }
    }
  };

  useEffect(() => {
    // Adjust height on mount and when the active view changes
    const observer = new ResizeObserver(() => {
        adjustHeights();
    });

    if (applicationsRef.current) observer.observe(applicationsRef.current);
    if (scheduleRef.current) observer.observe(scheduleRef.current);


    adjustHeights();

    // Adjust height on window resize
    window.addEventListener("resize", adjustHeights);
    return () => window.removeEventListener("resize", adjustHeights);
  }, [showWeeklySchedule]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  useEffect(() => {
    if (message) {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      const timeout = setTimeout(() => {
        setMessage("");
      }, 3000);
      setMessageTimeout(timeout);
    }
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [message]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        fetchApplications(token, data);
      } else {
        setIsLoading(false);
        setMessage("Failed to fetch user profile");
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Error fetching user profile: " + error.message);
    }
  };

  const fetchApplications = async (token, user) => {
    try {
      const url =
        user.role === "advisor"
          ? "http://localhost:3000/api/events/advisor"
          : "http://localhost:3000/api/events/";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
        setIsLoading(false);
      } else {
        setMessage("Failed to fetch applications");
      }
    } catch (error) {
      setMessage("Error fetching applications: " + error.message);
    }
  };

  const handleActionComplete = async () => {
    const token = localStorage.getItem("token");
    await fetchApplications(token, user);
  };

  const sortApplications = (applications) => {
    const sortedApplications = [...applications];
    if (sortOption === "default") {
      return sortedApplications.sort((a, b) => {
        const statusOrder = {
          pending: 1,
          scheduled: 2,
          accepted: 3,
          "canceled-resubmission-requested": 4,
          rejected: 5,
        };

        const statusA = statusOrder[a.status] || 999;
        const statusB = statusOrder[b.status] || 999;

        if (statusA !== statusB) return statusA - statusB;

        if (
          (a.status === "pending" || a.status === "scheduled") &&
          a.__t === "SchoolTour" &&
          b.__t === "SchoolTour"
        ) {
          return getPriorityScore(b) - getPriorityScore(a);
        }

        return new Date(b.visitDate) - new Date(a.visitDate);
      });
    }

    return sortedApplications.sort((a, b) => {
      switch (sortOption) {
        case "date":
          return new Date(b.visitDate) - new Date(a.visitDate);
        case "schoolName":
          return a.applicant?.name.localeCompare(b.applicant?.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "priority":
          return getPriorityScore(b) - getPriorityScore(a);
        case "appliedDate":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  };

  const getPriorityScore = (application) => {
    switch (application.applicant?.priority) {
      case "High":
        return 3;
      case "Medium":
        return 2;
      case "General":
        return 1;
      default:
        return 0;
    }
  };

  const tourFilteredApplications = sortApplications(
    applications.filter((app) => app.__t === tourType)
  );

  const toggleRowExpansion = (applicationId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  const renderExpandedDates = (application) => {
    if (!expandedRows.has(application._id)) return null;

    return (
      <tr className="expanded-dates-row">
        <td colSpan="100%">
          <div className="reserved-dates-container">
            <h4>Reserved Dates:</h4>
            <ul>
              {application.reserveDates.map((date, index) => (
                <li key={index}>
                  {new Date(date.visitDate).toLocaleDateString()} at {date.visitTime}
                </li>
              ))}
            </ul>
          </div>
        </td>
      </tr>
    );
  };

  const handleShowDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleOpenAddEventModal = (slot) => {
    setActiveSlot(slot);
    setIsAddEventModalOpen(true);
  };

  const handleCloseAddEventModal = () => {
    setIsAddEventModalOpen(false);
    setActiveSlot(null);
  };

  return (
    <div className="applications-page-container">

      <button
        className={`switch-button ${showWeeklySchedule ? "weekly-view" : "applications-view"}`}
        onClick={() => setShowWeeklySchedule((prev) => !prev)}
      >
        <div className="sliding-indicator">
          <div className="sliding-bar"></div>
        </div>
        {showWeeklySchedule ? "Applications" : "Weekly Schedule"}
      </button>

      <div className={`content-wrapper ${showWeeklySchedule ? "show-schedule" : ""}`} ref={wrapperRef}>
        <div className="applications-view" ref={applicationsRef}>
          <h1>APPLICATIONS</h1>
          {message && (
            <div
              className={`message-popup ${
                message.includes("Error") || message.includes("Failed") ? "error" : "success"
              }`}
            >
              {message}
            </div>
          )}
          <div className="controls-container">
            <div className="controls-left">
              <TypeSelectionTrio
                setShowType={setTourType}
                showType={tourType}
                haveFairButton={false}
                upperCase={false}
              />
              <div className="filter-sort-group">
                <div className="filter-controls">
                  <label htmlFor="filter">Filter by Status:</label>
                  <select
                    id="filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="canceled-resubmission-requested">Canceled</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="sort-controls">
                  <label htmlFor="sort">Sort by:</label>
                  <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="date">Date (Latest)</option>
                    <option value="appliedDate">Applied Date</option>
                    <option value="schoolName">School Name</option>
                    <option value="status">Status</option>
                    {tourType === "SchoolTour" && <option value="priority">Priority</option>}
                  </select>
                </div>
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <GeneralTable
            key={tourType}
            showFairs={false}
            showTours={true}
            showExtraProperties={{
              SchoolTour: [
                "priority",
                "city",
                "studentCount",
                "contactPerson",
                "email",
                "phoneNumber",
              ],
              IndividualTour: [
                "studentName",
                "studentHighSchool",
                "majorOfInterest",
                "email",
                "phoneNumber",
                "applicationDate",
              ],
            }}
            setMessage={setMessage}
            user={user}
            events={tourFilteredApplications}
            statusFilter={filterStatus}
            searchTerm={searchTerm}
            showType={tourType}
            setIsLoading={setIsLoading}
            EventRowActions={(props) => (
              <ApplicationsRowActions {...props} onActionComplete={handleActionComplete} />
            )} 
            
            extraRowContent={(application) => renderExpandedDates(application)}
            onShowDetails={handleShowDetails}
          />
          {isLoading && <LoadingSpinner />}
        </div>
        <div className="weekly-schedule-view" ref={scheduleRef}>
          <h1>Weekly Schedules</h1>
          <WeeklySchedules onAddEvent={handleOpenAddEventModal}/>
        </div>
      </div>
          {showDetailsModal && (
            <DetailsModal
              application={selectedApplication}
              onClose={() => setShowDetailsModal(false)}
              context="applications"
              user={user}
            />
          )}
          {isAddEventModalOpen && (
            <AddEventModal
              slot={activeSlot}
              onClose={handleCloseAddEventModal}
            />
          )}
    </div>
    
  );
}  
export default Applications;
