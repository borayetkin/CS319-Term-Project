import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdvisorPages/Applications.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import GeneralTable from "../../components/GeneralTable";
import ApplicationsRowActions from "../../components/ApplicationsRowActions";
import TypeSelectionTrio from "../../components/TypeSelectionTrio";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);
  const [tourType, setTourType] = useState("SchoolTour");
  const [slideIndex, setSlideIndex] = useState(0);
  const [sortOption, setSortOption] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showWeeklySchedules, setShowWeeklySchedules] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
      fetchWeeklySchedules(token);
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
        setMessage("Failed to fetch applications");
      }
    } catch (error) {
      setMessage("Error fetching applications: " + error.message);
    }
  };

  const fetchWeeklySchedules = async (token) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/schedules`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWeeklySchedules(data);
      } else {
        setMessage("Failed to fetch weekly schedules");
      }
    } catch (error) {
      setMessage("Error fetching weekly schedules: " + error.message);
    }
  };

  const handleRebuildSchedules = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/schedules/rebuild`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWeeklySchedules(data);
        alert("Schedules rebuilt successfully!");
      } else {
        alert("Failed to rebuild schedules.");
      }
    } catch (error) {
      alert("Error rebuilding schedules: " + error.message);
    }
  };

  const sortApplications = (applications) => {
    const sortedApplications = [...applications];
    if (sortOption === "default") return applications.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      if (a.status === "pending" && b.status === "pending") {
        return getPriorityScore(b) -getPriorityScore(a)
      }
      return new Date(b.visitDate) - new Date(a.visitDate)
  });
    return sortedApplications.sort((a, b) => {
      if (sortOption === "date") {
        return new Date(b.visitDate) - new Date(a.visitDate);
      } else if (sortOption === "schoolName") {
        return a.applicant?.name.localeCompare(b.applicant?.name);
      } else if (sortOption === "status") {
        return a.status.localeCompare(b.status);
      } else if (tourType === "SchoolTour" && sortOption === "priority") {
        return getPriorityScore(b) - getPriorityScore(a);
      } else if (sortOption === "appliedDate") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  const getPriorityScore = (application) => {
    if (application.applicant?.priority === "High") return 3;
    if (application.applicant?.priority === "Medium") return 2;
    if (application.applicant?.priority === "General") return 1;
    return 0;
  };

  const handleWeekChange = (direction) => {
    setCurrentWeekIndex((prevIndex) => {
      const newIndex = prevIndex + direction;
      if (newIndex < 0) return weeklySchedules.length - 1;
      if (newIndex >= weeklySchedules.length) return 0;
      return newIndex;
    });
  };
  const handleSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % sliderContent.length);
  };

  const toggleWeeklySchedules = () => {
    setShowWeeklySchedules((prev) => !prev);
  };

  const sliderContent = [
    `Pending Applications: ${applications.filter((app) => app.status === "pending").length}`,
    `Pending School Tours: ${applications.filter(
      (app) => app.status === "pending" && app.__t === "SchoolTour"
    ).length}`,
    `Pending Individual Tours: ${applications.filter(
      (app) => app.status === "pending" && app.__t === "IndividualTour"
    ).length}`,
  ];

  const tourFilteredApplications = sortApplications(
    applications.filter((app) => app.__t === tourType)
  );

  return (
    <div className="applications-page-container">
      <h1>APPLICATIONS</h1>
      <TypeSelectionTrio
        setShowType={setTourType}
        haveFairButton={false}
        haveSchoolTourButton={true}
        haveIndividualTourButton={true}
        showType={tourType}
      />

      {message && <p>{message}</p>}

      <div className="controls-container">
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
        </div>

        <div className="slider-box">
          <div className="slider-content">{sliderContent[slideIndex]}</div>
          <div className="slider-arrows">
            <span className="slider-arrow slider-left" onClick={() => handleSlide(-1)}>
              ◀
            </span>
            <span className="slider-arrow slider-right" onClick={() => handleSlide(1)}>
              ▶
            </span>
          </div>
        </div>

        <div className="button-group">
          <button
            onClick={toggleWeeklySchedules}
            className={`weekly-schedule-toggle ${
              showWeeklySchedules ? "soft-red" : "green"
            }`}
          >
            {showWeeklySchedules ? "Show Applications" : "Show Weekly Schedules"}
          </button>
          <button onClick={handleRebuildSchedules} className="rebuild-schedules-button">
            Rebuild Schedules
          </button>
        </div>
      </div>

      {showWeeklySchedules ? (
        <div className="weekly-schedule">
          <div className="weekly-controls">
            <button onClick={() => handleWeekChange(-1)}>← Previous</button>
            <p className="date-range">
              {new Date(weeklySchedules[currentWeekIndex]?.weekBeginning).toLocaleDateString("en-GB", {
                timeZone: "UTC",
              })}{" "}
              -{" "}
              {new Date(weeklySchedules[currentWeekIndex]?.weekEnding).toLocaleDateString("en-GB", {
                timeZone: "UTC",
              })}
            </p>
            <button onClick={() => handleWeekChange(1)}>Next →</button>
          </div>
          <div className="schedule-info">
            <p><span className="legend accepted"></span> Accepted</p>
            <p><span className="legend scheduled"></span> Scheduled</p>
          </div>
          {weeklySchedules.length > 0 && weeklySchedules[currentWeekIndex]?.slots ? (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["09:00", "11:00", "13:30", "16:00"].map((time) => (
                  <tr key={time}>
                    <td>{time}</td>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                      const slot = weeklySchedules[currentWeekIndex].slots.find(
                        (s) => s.slotDay === day && s.slotTime === time
                      );
                      return (
                        <td key={day}>
                          {slot && slot.event ? (
                            <div
                              className="event"
                              style={{
                                backgroundColor:
                                  slot.event.status === "scheduled"
                                    ? "#fef3c7" // Soft yellow
                                    : slot.event.status === "accepted"
                                    ? "#d1fae5" // Soft green
                                    : "#edf2f7", // Default
                              }}
                            >
                              {slot.event.schoolName}
                            </div>
                          ) : (
                            <p>No event</p>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No schedules available</p>
          )}
        </div>
      ) : (
        <GeneralTable
          showFairs={false}
          showTours={true}
          showExtraProperties={{
            SchoolTour: ["schoolName", "priority", "city", "studentCount", "contactPerson", "email", "phoneNumber", "applicationDate"],
            IndividualTour: ["studentName", "studentHighSchool", "majorOfInterest", "email", "phoneNumber", "applicationDate"],
          }}
          setMessage={setMessage}
          user={user}
          events={tourFilteredApplications}
          statusFilter={filterStatus}
          searchTerm=""
          showType={tourType}
          setIsLoading={setIsLoading}
          EventRowActions={ApplicationsRowActions}
        />
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default Applications;
