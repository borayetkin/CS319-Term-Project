import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import EventRow from "./EventRow";
import FairRow from "./FairRow";

const GeneralTable = ({
  showFairs = true,
  showTours = true,
  showExtraProperties = { SchoolTour: [], IndividualTour: [], Fair: [] },
  setMessage = () => {},
  setError = () => {},
  user = null,
  events = [],
  fairs = [],
  filter = "",
  statusFilter = "all",
  searchTerm = "",
  showType = "SchoolTour",
  setIsLoading = () => {},
  EventRowActions = () => {},
  FairRowActions = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(
    (showType === "Fair" ? fairs.length : events.length) / rowsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const paginate = (items) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return items.slice(startIndex, startIndex + rowsPerPage);
  };

  const renderSchoolTours = (events) => {
    return paginate(events.filter((event) => event.__t === "SchoolTour")).map((event) => (
      <EventRow
        key={event._id}
        event={event}
        user={user}
        setMessage={setMessage}
        showExtraProperties={showExtraProperties.SchoolTour}
        EventRowActions={EventRowActions}
      />
    ));
  };

  const renderIndividualTours = (events) => {
    return paginate(events.filter((event) => event.__t === "IndividualTour")).map((event) => (
      <EventRow
        key={event._id}
        event={event}
        user={user}
        setMessage={setMessage}
        showExtraProperties={showExtraProperties.IndividualTour}
        EventRowActions={EventRowActions}
      />
    ));
  };

  const renderFairs = (fairs) => {
    return paginate(fairs).map((fair) => (
      <FairRow
        key={fair._id}
        fair={fair}
        user={user}
        setMessage={setMessage}
        showExtraProperties={showExtraProperties.Fair}
        FairRowActions={FairRowActions}
      />
    ));
  };

  const formatPropertyName = (property) => {
    return property
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const renderSchoolTourTableHeader = () => {
    return (
      <tr>
        <th>Name</th>
        <th>Time</th>
        <th>Date</th>
        {showExtraProperties.SchoolTour.map((property) => (
          <th key={property}>{renderHeaderName(property)}</th>
        ))}
        <th>Status</th>
        <th>Actions</th>
      </tr>
    );
  };
  
  const filteredEvents = events.filter((event) => {
    return (
      (
        (event.applicant?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      event.visitDate?.includes(searchTerm) ||
      event.requiredNumberOfGuides.toString().includes(searchTerm))  && (statusFilter === "all" || event.status === statusFilter)
    );
  });
  const filteredFairs = fairs.filter((fair) => {
    
    
    return ((
      fair.organiserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fair.fairDate.includes(searchTerm) ||
      fair.requiredNumberOfGuides.toString().includes(searchTerm)) && (statusFilter === "all" || fair.status === statusFilter)
    );
  });
  const renderHeaderName = (property) => {
    if (property === "assignedUsers") {
      return "Assigned Guides";
    }
    if (property === "requiredNumberOfGuides") {
      return "Required Guides";
    }
    if (property === "studentHighSchool") {
      return "High School";
    }

    return formatPropertyName(property);
  };
  const renderIndividualTourTableHeader = () => {
    return (
      <tr>
        <th>Name</th>
        <th>Time</th>
        <th>Date</th>

        {showExtraProperties.IndividualTour.map((property) => (
          <th key={property}>{renderHeaderName(property)}</th>
        ))}
        <th>Status</th>
        <th>Actions</th>
      </tr>
    );
  };
  const renderFairTableHeader = () => {
    return (
      <tr>
        <th>School Name</th>
        <th>Type</th>
        <th>Date</th>
        {showExtraProperties.Fair.map((property) => (
          <th key={property}>{renderHeaderName(property)}</th>
        ))}
        <th>Status</th>
        <th>Actions</th>
      </tr>
    );
  };

  const buttonStyle = {
    margin: "0 5px",
    cursor: "pointer",
    padding : ".5rem"
  };

  const disabledButtonStyle = {
    padding : ".5rem",
    margin: "0 5px",
    cursor: "default",
    backgroundColor: "gray",
    hover : "none"

  };

  return (
    <>
      <table>
        <thead>
          {showType === "SchoolTour" && renderSchoolTourTableHeader()}
          {showType === "IndividualTour" && renderIndividualTourTableHeader()}
          {showType === "Fair" && renderFairTableHeader()}
        </thead>
        <tbody>
          {showType === "Fair" && showFairs && renderFairs(filteredFairs)}
          {showTours &&
            showType === "SchoolTour" &&
            renderSchoolTours(filteredEvents)}
          {showTours &&
            showType === "IndividualTour" &&
            renderIndividualTours(filteredEvents)}
        </tbody>
      </table>
      {totalPages> 1 &&<div style={{ display: "flex", alignItems: "center", marginTop: "10px", justifyContent : "center" , gap : "2rem"}}>
        <button
          onClick={handlePreviousPage}
          style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
        >
          <FaArrowLeft />
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={handleNextPage}
          style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
        >
          <FaArrowRight />
        </button>
      </div>}
    </>
  );
};

export default GeneralTable;
