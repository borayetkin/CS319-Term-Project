import "../styles/components/DetailsModal.css";
import { useState } from "react";

const DetailsModal = ({ application, onClose, context, user }) => {
  console.log("DetailsModal props:", { application, context, user });

  const [updatedAssignments, setUpdatedAssignments] = useState({});
  const [updatedRemovals, setUpdatedRemovals] = useState({});
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const isFair = application.hasOwnProperty("fairDate");
  const isSchoolTour = application.hasOwnProperty("contactPersonRole");
  const isApplicationContext = context === "applications";

  const checkIfGuideHasBeenAssigned = (guide) => {
    return application.assignedUsers?.some(
      (assignedGuide) => assignedGuide._id === guide._id
    );
  };

  const saveChanges = async () => {
    const guideToAssign = updatedAssignments[application._id];
    const guideToRemove = updatedRemovals[application._id];

    try {
      // Assign new guide
      if (guideToAssign) {
        const assignResponse = await fetch(
          "http://localhost:3000/api/events/assign-guide",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userID: guideToAssign,
              eventID: application._id,
            }),
          }
        );

        if (!assignResponse.ok) {
          const errorData = await assignResponse.json();
          throw new Error(errorData.message || "Failed to assign guide");
        }
      }

      // Remove selected guide
      if (guideToRemove) {
        const removeResponse = await fetch(
          "http://localhost:3000/api/events/remove-guide",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userID: guideToRemove,
              eventID: application._id,
            }),
          }
        );

        if (!removeResponse.ok) {
          const errorData = await removeResponse.json();
          throw new Error(errorData.message || "Failed to remove guide");
        }
      }

      setMessage("Changes saved successfully!");
      // Clear selections
      setUpdatedAssignments({});
      setUpdatedRemovals({});
    } catch (error) {
      setMessage("Error saving changes: " + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {isFair
              ? "Fair Details"
              : isApplicationContext
              ? "Application Details"
              : "Event Details"}
          </h2>
          <button className="close-button" onClick={onClose} >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1L13 13M1 13L13 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                
              />
            </svg>
          </button>
        </div>

        <div className="details-grid">
          {isApplicationContext ? (
            // Application context - show detailed application information
            <>
              <div className="detail-group">
                <div className="detail-item">
                  <label>{isFair ? "School Name" : "Name"}</label>
                  <p>
                    {isFair
                      ? application.schoolName
                      : application.applicant?.name || "N/A"}
                  </p>
                </div>
                {isSchoolTour && (
                  <div className="detail-item">
                    <label>Contact Person Role</label>
                    <p>{application.contactPersonRole || "N/A"}</p>
                  </div>
                )}
                {!isFair && application.applicant?.priority && (
                  <div className="detail-item">
                    <label>Priority</label>
                    <span
                      className={`priority-badge ${
                        application.applicant.priority?.toLowerCase() || "na"
                      }`}
                    >
                      {application.applicant.priority}
                    </span>
                  </div>
                )}

                {!isFair && (
                  <>
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{application.applicant?.email || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{application.applicant?.phoneNumber || "N/A"}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Primary {isFair ? "Fair" : "Visit"} Date</label>
                  <p className="datetime">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                    >
                      <path
                        fill="currentColor"
                        d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"
                      />
                    </svg>
                    {new Date(
                      isFair ? application.fairDate : application.visitDate
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="detail-item">
                  <label>{isFair ? "Fair" : "Visit"} Time</label>
                  <p className="datetime">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                    >
                      <path
                        fill="currentColor"
                        d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
                      />
                    </svg>
                    {isFair ? application.fairTime : application.visitTime}
                  </p>
                </div>
              </div>

              {!isFair &&
                isApplicationContext &&
                application.alternativeDates && (
                  <div className="detail-group">
                    <div className="detail-item">
                      <label>Alternative Dates</label>
                      <div className="alternative-dates">
                        {application.alternativeDates.map((date, index) => (
                          <p key={index} className="datetime">
                            <svg
                              className="icon"
                              viewBox="0 0 24 24"
                              width="14"
                              height="14"
                            >
                              <path
                                fill="currentColor"
                                d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"
                              />
                            </svg>
                            {new Date(date).toLocaleDateString()}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {isApplicationContext &&
                application.reserveDates &&
                application.reserveDates.length > 0 && (
                  <div className="detail-group">
                    <div className="detail-item">
                      <label>Reserved Dates</label>
                      <div className="reserved-dates">
                        {application.reserveDates.map((dateObj, index) => (
                          <div key={index} className="reserved-date-item">
                            <p className="datetime">
                              <svg
                                className="icon"
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                              >
                                <path
                                  fill="currentColor"
                                  d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"
                                />
                              </svg>
                              <span>
                                {new Date(dateObj.visitDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                              <span className="time">
                                <svg
                                  className="icon"
                                  viewBox="0 0 24 24"
                                  width="14"
                                  height="14"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
                                  />
                                </svg>
                                {dateObj.visitTime}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              <div className="detail-group">
                <div className="detail-item">
                  <label>City</label>
                  <p>{application.city || "N/A"}</p>
                </div>
                {!isFair && (
                  <div className="detail-item">
                    <label>District</label>
                    <p>{application.district || "N/A"}</p>
                  </div>
                )}
                {application.location && (
                  <div className="detail-item">
                    <label>Location</label>
                    <p>{application.location}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Events context - show event details with assigned guides
            <>
              <div className="detail-group">
                {isFair ? (
                  <>
                    <div className="detail-item">
                      <label>School Name</label>
                      <p>{application.schoolName || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Organiser Name</label>
                      <p>{application.organiserName || "N/A"}</p>
                    </div>
                  </>
                ) : (
                  <div className="detail-item">
                    <label>Name</label>
                    <p>{application.applicant?.name || "N/A"}</p>
                  </div>
                )}

                <div className="detail-item">
                  <label>Location</label>
                  <p>{application.location || application.city || "N/A"}</p>
                </div>
              </div>

              {!isFair && application.assignedAdvisor && (
                <div className="detail-group">
                  <div className="detail-item">
                    <label>Assigned Advisor</label>
                    <div className="assigned-guides">
                      <div className="guide-item">
                        <div className="guide-header">
                          <svg
                            className="icon"
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                          >
                            <path
                              fill="currentColor"
                              d="M20 17V19H13V17H20M11 17V19H4V17H11M20 13V15H13V13H20M11 13V15H4V13H11M20 9V11H13V9H20M11 9V11H4V9H11M20 5V7H13V5H20M11 5V7H4V5H11Z"
                            />
                          </svg>
                          <span className="guide-name">
                            {application.assignedAdvisor?.name ||
                              "Unknown Advisor"}
                          </span>
                        </div>
                        <div className="guide-details">
                          <p>
                            <span>Email:</span>{" "}
                            {application.assignedAdvisor?.email || "N/A"}
                          </p>
                          <p>
                            <span>Phone:</span>{" "}
                            {application.assignedAdvisor?.phoneNumber || "N/A"}
                          </p>
                          <p>
                            <span>Department:</span>{" "}
                            {application.assignedAdvisor?.department || "N/A"}
                          </p>
                          <p>
                            <span>advisor Notes:</span>{" "}
                            {application.advisorNotes || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {application.assignedUsers &&
                application.assignedUsers.length > 0 && (
                  <div className="detail-group">
                    <div className="detail-item">
                      <label>Assigned Guides</label>
                      <div className="assigned-guides">
                        {application.assignedUsers.map((user, index) => (
                          <div key={index} className="guide-item">
                            <div className="guide-header">
                              <svg
                                className="icon"
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                              >
                                <path
                                  fill="currentColor"
                                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                                />
                              </svg>
                              <span className="guide-name">
                                {user.name || "Unknown Guide"}
                              </span>
                            </div>
                            <div className="guide-details">
                              <p>
                                <span>Email:</span> {user.email || "N/A"}
                              </p>
                              <p>
                                <span>Phone:</span> {user.phoneNumber || "N/A"}
                              </p>
                              <p>
                                <span>Major:</span> {user.major || "N/A"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {application.appliedUsers &&
                application.appliedUsers.length > 0 && (
                  <div className="detail-group">
                    <div className="detail-item">
                      <label>Applied Guides</label>
                      <div className="assigned-guides">
                        {application.appliedUsers.map((user, index) => (
                          <div key={index} className="guide-item">
                            <div className="guide-header">
                              <svg
                                className="icon"
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                              >
                                <path
                                  fill="currentColor"
                                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                                />
                              </svg>
                              <span className="guide-name">
                                {user.name || "Unknown Guide"}
                              </span>
                            </div>
                            <div className="guide-details">
                              <p>
                                <span>Email:</span> {user.email || "N/A"}
                              </p>
                              <p>
                                <span>Phone:</span> {user.phoneNumber || "N/A"}
                              </p>
                              <p>
                                <span>Major:</span> {user.major || "N/A"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              <div className="detail-group">
                <div className="detail-item">
                  <label>{isFair ? "Fair Date" : "Visit Date"}</label>
                  <p className="datetime">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                    >
                      <path
                        fill="currentColor"
                        d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"
                      />
                    </svg>
                    {new Date(
                      isFair ? application.fairDate : application.visitDate
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="detail-item">
                  <label>{isFair ? "Fair Time" : "Visit Time"}</label>
                  <p className="datetime">
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                    >
                      <path
                        fill="currentColor"
                        d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
                      />
                    </svg>
                    {isFair ? application.fairTime : application.visitTime}
                  </p>
                </div>
                {isFair ? "":
                <div className="detail-item">

                    <label>{"Reserved Room"}</label>
                    <p className="datetime">
                      <svg
                        className="icon"
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                      >
                        <path
                          fill="currentColor"
                          d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
                        />
                      </svg>
                      {application.reservedRooms}
                    </p>
                </div>
                }
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Required Guides</label>
                  <p>{application.requiredNumberOfGuides || "N/A"}</p>
                </div>

                {isApplicationContext && application.applicationDate && (
                  <div className="detail-item">
                    <label>Application Date</label>
                    <p className="datetime">
                      <svg
                        className="icon"
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                      >
                        <path
                          fill="currentColor"
                          d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"
                        />
                      </svg>
                      {new Date(
                        application.applicationDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${application.status}`}>
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </span>
                </div>

                {application.additionalNotes && (
                  <div className="detail-item notes">
                    <label>Additional Notes</label>
                    <p>{application.additionalNotes}</p>
                  </div>
                )}

                {isApplicationContext && application.advisorNotes && (
                  <div className="detail-item notes">
                    <label>Advisor Notes</label>
                    <p>{application.advisorNotes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
