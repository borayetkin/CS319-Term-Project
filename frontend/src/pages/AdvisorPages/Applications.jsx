import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "../../styles/AdvisorPages/Applications.css";
import { FaEye, FaCheck, FaTimes, FaTrash } from "react-icons/fa"; // Import icons
import LoadingSpinner from "../../components/LoadingSpinner";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);
  const [tourType, setTourType] = useState("SchoolTour");
  const [slideIndex, setSlideIndex] = useState(0); // New state for slider
  const [sortOption, setSortOption] = useState("default");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log(isLoading);

      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const fetchApplications = async (token, us) => {
    try {
      const response =
        us.role === "advisor"
          ? await fetch(`http://localhost:3000/api/events/advisor`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : await fetch(`http://localhost:3000/api/events/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
        setIsLoading(false);
      } else {
        setMessage(`Failed to fetch applications`);
      }
    } catch (error) {
      setMessage("Error fetching applications: " + error.message);
    }
  };

  const handleAction = async (eventId, event, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            userrole: user.role,
            userid: user._id,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, event }),
        }
      );

      if (response.ok) {
        setMessage(
          `Application ${status} successfully. An email notification has been sent to the applicant.`
        );
        fetchApplications(token, user); // Refresh applications
      } else {
        const errData = await response.json();
        setMessage(`Failed to ${status} application: ${errData.message}`);
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setMessage("Application deleted successfully.");
        await fetchApplications(token, user); // Refresh applications
      } else {
        setMessage("Failed to delete application.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const getPriorityScore = (application) => {
    const priority = application?.applicant?.priority;
    if (!priority) return 0;
    switch (priority) {
      case "High": return 3;   // Preferred schools
      case "Medium": return 2; // Focus schools
      case "General": return 1;
      default: return 0;
    }
  };

  const getFilteredAndSortedApplications = () => {
    let filtered = applications.filter((app) => {
      if (filterStatus !== "all" && app.status !== filterStatus) {
        return false;
      }
      if (tourType !== "all" && app.__t !== tourType) {
        return false;
      }
      if (user && user.role === "advisor" && user.assignedDay) {
        return app.weekday === user.assignedDay;
      }
      return true;
    });
<<<<<<< HEAD
    const getPriorityScore = (application) => {
      const priority = application.applicant.priority;
      if (!priority) return 0;
      switch (priority) {
        case "High":
          return 3; // Preferred schools
        case "Medium":
          return 2; // Focus schools
        case "General":
          return 1;
        default:
          return 0;
      }
    };
=======
>>>>>>> 94aabc1 (Fixed the bug that makex applications now show up for coordinators)
    // Apply sorting based on selected option
    switch (sortOption) {
      case "default":
        filtered.sort((a, b) => {
          // First, sort by pending status
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (b.status === "pending" && a.status !== "pending") return 1;

          // If both are pending, sort by school priority
          if (a.status === "pending" && b.status === "pending") {
            return getPriorityScore(b) - getPriorityScore(a);
          }

          // If neither is pending, sort by date
          return new Date(b.visitDate) - new Date(a.visitDate);
        });
        break;
      case "date":
        filtered.sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
        break;
      case "schoolName":
        filtered.sort((a, b) =>
          (a.schoolName || "").localeCompare(b.schoolName || "")
        );
        break;
      case "status":
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "priority":
        filtered.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
        break;
    }

    return filtered;
  };

  const filteredApplications = getFilteredAndSortedApplications();

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setShowDetailsModal(true);
  };

  // Calculate counts for the slider
  const pendingApplicationsCount = applications.filter(
    (app) => app.status === "pending"
  ).length;
  const pendingSchoolToursCount = applications.filter(
    (app) => app.status === "pending" && app.__t === "SchoolTour"
  ).length;
  const pendingIndividualToursCount = applications.filter(
    (app) => app.status === "pending" && app.__t === "IndividualTour"
  ).length;

  const sliderContent = [
    `Pending Applications: ${pendingApplicationsCount}`,
    `Pending School Tours: ${pendingSchoolToursCount}`,
    `Pending Individual Tours: ${pendingIndividualToursCount}`,
  ];

  const handleSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % sliderContent.length);
  };

  const DetailsModal = ({ application, onClose }) => {
    if (!application) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
          <h2>Application Details</h2>

          <div className="details-grid">
            {application.__t === "SchoolTour" ? (
              <>
                <div className="detail-item">
                  <label>School Name:</label>
                  <p>{application.schoolName || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>School Priority:</label>
                  <p>{application?.applicant?.priority || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>City:</label>
                  <p>{application.city || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Visit Date:</label>
                  <p>{new Date(application.visitDate).toLocaleDateString()}</p>
                </div>

                <div className="detail-item">
                  <label>Visit Time:</label>
                  <p>{application.visitTime || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Student Count:</label>
                  <p>{application.studentCount || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Contact Person:</label>
                  <p>{application.contactPerson || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Email:</label>
                  <p>{application.email || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Phone Number:</label>
                  <p>{application.phoneNumber || "N/A"}</p>
                </div>
              </>
            ) : (
              <>
                <div className="detail-item">
                  <label>Student Name:</label>
                  <p>{application.studentName || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Student High School:</label>
                  <p>{application.studentHighSchool || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Visit Date:</label>
                  <p>{new Date(application.visitDate).toLocaleDateString()}</p>
                </div>

                <div className="detail-item">
                  <label>Visit Time:</label>
                  <p>{application.visitTime || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Email:</label>
                  <p>{application.applicant.email || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Phone Number:</label>
                  <p>{application.applicant.phoneNumber || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Major of Interest:</label>
                  <p>{application.majorOfInterest || "N/A"}</p>
                </div>
              </>
            )}

            <div className="detail-item">
              <label>Status:</label>
              <p className={`status-badge ${application.status}`}>
                {application.status.charAt(0).toUpperCase() +
                  application.status.slice(1)}
              </p>
            </div>

            <div className="detail-item full-width">
              <label>Additional Notes:</label>
              <p className="notes">
                {application.additionalNotes || "No additional notes"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="applications-page-container">
      <h1>APPLICATIONS</h1>
      <div className="slider-box" onClick={handleSlide}>
        {sliderContent[slideIndex]}
      </div>
      {message && <p>{message}</p>}
      <div className="controls-container">
        <div className="filter-controls">
          <label htmlFor="filter">Filter by Status:</label>
          <select
            id="filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="tour-type-controls">
          <h2 className="tour-type-heading">
            Showing {tourType === "SchoolTour" ? "School" : "Individual"} Tours
          </h2>
          <button
            onClick={() =>
              setTourType(
                tourType === "SchoolTour" ? "IndividualTour" : "SchoolTour"
              )
            }
          >
            {tourType === "SchoolTour"
              ? "Show Individual Tours"
              : "Show School Tours"}
          </button>
        </div>
        <div className="sort-controls">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="date">Date</option>
            <option value="schoolName">School Name</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            {tourType === "SchoolTour" ? (
              <>
                <th>High School Name</th>
                <th>High School Priority</th>
                <th>City</th>
                <th>Date</th>
                <th>Time</th>
                <th>Student Amount</th>
                <th>Applicant Name</th>
                <th>Applicant Email</th>
                <th>Applicant Number</th>
                <th>Status</th>
                <th>Actions</th>
              </>
            ) : (
              <>
                <th>Applicant Name</th>
                <th>Student High School</th>
                <th>Date</th>
                <th>Time</th>
                <th>Person Email</th>
                <th>Person Number</th>
                <th>Major of Interest</th>
                <th>Status</th>
                <th>Actions</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => {
              let className = "";
              if (app.status === "accepted") {
                className = "accepted";
              } else if (app.status === "rejected") {
                className = "rejected";
              } else {
                className = "pending";
              }

              return (
                <tr key={app._id} className={className}>
                  {tourType === "SchoolTour" ? (
                    <>
                      <td>{app.schoolName || "N/A"}</td>
                      <td>{app?.applicant?.priority || "N/A"}</td>
                      <td>{app.city || "N/A"}</td>
                      <td>{new Date(app.visitDate).toLocaleDateString()}</td>
                      <td>{app.visitTime || "N/A"}</td>
                      <td>{app.studentCount || "N/A"}</td>
                      <td>{app.contactPerson || "N/A"}</td>
                      <td title={app.email}>{app.email || "N/A"}</td>
                      <td>{app.phoneNumber || "N/A"}</td>
                      <td className={`status ${app.status}`}>{app.status}</td>
                      <td>
                        <div className="button-container">
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="view-details"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {app.status === "pending" && (
                            <>
                              <button
                                className="accept"
                                onClick={() =>
                                  handleAction(app._id, app, "accepted")
                                }
                                title="Accept"
                              >
                                <FaCheck />
                              </button>
                              <button
                                className="decline"
                                onClick={() =>
                                  handleAction(app._id, app, "rejected")
                                }
                                title="Decline"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button
                            className="delete"
                            onClick={() => handleDelete(app._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{app.studentName || "N/A"}</td>
                      <td>{app.studentHighSchool || "N/A"}</td>
                      <td>{new Date(app.visitDate).toLocaleDateString()}</td>
                      <td>{app.visitTime || "N/A"}</td>
                      <td>{app.applicant.email || "N/A"}</td>
                      <td>{app.applicant.phoneNumber || "N/A"}</td>
                      <td>{app.majorOfInterest || "N/A"}</td>
                      <td className={`status ${app.status}`}>{app.status}</td>
                      <td>
                        <div className="button-container">
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="view-details"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {app.status === "pending" && (
                            <>
                              <button
                                className="accept"
                                onClick={() =>
                                  handleAction(app._id, app, "accepted")
                                }
                                title="Accept"
                              >
                                <FaCheck />
                              </button>
                              <button
                                className="decline"
                                onClick={() =>
                                  handleAction(app._id, app, "rejected")
                                }
                                title="Decline"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button
                            className="delete"
                            onClick={() => handleDelete(app._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })
          ) : isLoading ? (
            <tr>
              <td
                colSpan="100"
                style={{ textAlign: "center", background: "none" }}
              >
                <div>
                  <LoadingSpinner
                    loading="Applications"
                    style={{ maxHeight: "100px" }}
                  />
                </div>
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan="100" style={{ textAlign: "center" }}>
                No applications found.
              </td>
            </tr>
          )}
          {showDetailsModal && (
            <DetailsModal
              application={selectedApplication}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Applications;
