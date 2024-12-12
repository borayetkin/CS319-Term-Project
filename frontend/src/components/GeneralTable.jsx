import React, { useEffect, useState } from "react";
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
  tourType = "SchoolTour",
  setIsLoading = () => {},
  EventRowActions = () => {},
  FairRowActions = () => {},
}) => {
  const renderSchoolTours = (events) => {
    return events
      .filter((event) => event.__t === "SchoolTour")
      .map((event) => (
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
    return events
      .filter((event) => event.__t === "IndividualTour")
      .map((event) => (
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
    return fairs.map((fair) => (
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
  return (
    <>
      <table>
        <thead>
          {filter === "SchoolTour" && renderSchoolTourTableHeader()}
          {filter === "IndividualTour" && renderIndividualTourTableHeader()}
          {filter === "fairs" && renderFairTableHeader()}
        </thead>
        <tbody>
          {filter === "fairs" && showFairs && renderFairs(filteredFairs)}
          {showTours &&
            filter === "SchoolTour" &&
            renderSchoolTours(filteredEvents)}
          {showTours &&
            filter === "IndividualTour" &&
            renderIndividualTours(filteredEvents)}
        </tbody>
      </table>
    </>
  );
};

export default GeneralTable;
