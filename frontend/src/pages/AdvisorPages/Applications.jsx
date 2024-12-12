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

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
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
  const sortApplications = (applications) => {
    
    if (sortOption === "default") return applications.sort((a, b) => {
        return new Date(a.visitDate)-new Date(b.visitDate) ;
    });
    return applications.sort((a, b) => {

      if (sortOption === "date") {
        return  new Date(b.visitDate)-new Date(a.visitDate) ;
      } else if (sortOption === "schoolName") {
        return a.applicant?.name.localeCompare(b.applicant?.name);
      } else if (sortOption === "status") {
        return a.status.localeCompare(b.status);
      } else if (tourType === "SchoolTour"&& sortOption === "priority") {
        return getPriortyScore(b) - getPriortyScore(a);
      } else if(sortOption === "appliedDate") {
        return new Date(b.createdAt)-new Date(a.createdAt);
      }
      

      
      
    })};
  const getPriortyScore = (application) => {
    if (application.applicant?.priority === "High") return 3;
    if (application.applicant?.priority === "Medium") return 2;
    if (application.applicant?.priority === "General") return 1;
    return 0;
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

  const handleSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % sliderContent.length);
  };

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
  const tourFilteredApplications = applications.filter(
    (app) => app.__t === tourType
  );

  const sortedApplications = sortApplications(tourFilteredApplications);
  return (
    <div className="applications-page-container">
      <h1>APPLICATIONS</h1>
      <TypeSelectionTrio setShowType={ setTourType} haveFairButton={false} haveSchoolTourButton={true} haveIndividualTourButton={true} showType={tourType} />

      
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
        <div className="slider-box" onClick={handleSlide}>
        {sliderContent[slideIndex]}
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
            {tourType === "SchoolTour"&&(<option value="priority">Priority</option>)}
          </select>
        </div>
      </div>
      <GeneralTable
        showFairs={false}
        showTours={true}
        showExtraProperties={{
          SchoolTour: ["schoolName", "priority", "city", "studentCount", "contactPerson", "email", "phoneNumber","applicationDate"],
          IndividualTour: ["studentName", "studentHighSchool", "majorOfInterest", "email", "phoneNumber","applicationDate"],
        }}
        setMessage={setMessage}
        user={user}
        events={sortedApplications}

        statusFilter= {filterStatus}
        searchTerm=""
        showType={tourType}
        setIsLoading={setIsLoading}
        EventRowActions={ApplicationsRowActions}
      />
       {isLoading && <LoadingSpinner />}         

    </div>
  );
};

export default Applications;
