import "../styles/components/DetailsModal.css";

const DetailsModal = ({ application, onClose, context = "applications" }) => {
  if (!application) return null;

  const isFair = application.hasOwnProperty('fairDate');
  const isApplicationContext = context === "applications";

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {isFair ? 'Fair Detaiasdasdasdasdadals' : isApplicationContext ? 'Application Details' : 'Event Details'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="details-grid">
          {isApplicationContext ? (
            // Application context - show detailed application information
            <>
              <div className="detail-group">
                <div className="detail-item">
                  <label>{isFair ? 'School Name' : 'Name'}</label>
                  <p>{isFair ? application.schoolName : application.applicant?.name || "N/A"}</p>
                </div>

                {!isFair && application.applicant?.priority && (
                  <div className="detail-item">
                    <label>Priority</label>
                    <span className={`priority-badge ${application.applicant.priority?.toLowerCase() || 'na'}`}>
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
                  <label>Primary {isFair ? 'Fair' : 'Visit'} Date</label>
                  <p className="datetime">
                    <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                      <path fill="currentColor" d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                    </svg>
                    {new Date(isFair ? application.fairDate : application.visitDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="detail-item">
                  <label>{isFair ? 'Fair' : 'Visit'} Time</label>
                  <p className="datetime">
                    <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                      <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                    </svg>
                    {isFair ? application.fairTime : application.visitTime}
                  </p>
                </div>
              </div>

              {!isFair && isApplicationContext && application.alternativeDates && (
                <div className="detail-group">
                  <div className="detail-item">
                    <label>Alternative Dates</label>
                    <div className="alternative-dates">
                      {application.alternativeDates.map((date, index) => (
                        <p key={index} className="datetime">
                          <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                            <path fill="currentColor" d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                          </svg>
                          {new Date(date).toLocaleDateString()}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!isFair && isApplicationContext && application.reserveDates && application.reserveDates.length > 0 && (
                <div className="detail-group">
                  <div className="detail-item">
                    <label>Reserved Dates</label>
                    <div className="alternative-dates">
                      {application.reserveDates.map((dateObj, index) => (
                        <p key={index} className="datetime">
                          <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                            <path fill="currentColor" d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                          </svg>
                          {new Date(dateObj.visitDate).toLocaleDateString()} at {dateObj.visitTime}
                        </p>
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
                          <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                            <path fill="currentColor" d="M20 17V19H13V17H20M11 17V19H4V17H11M20 13V15H13V13H20M11 13V15H4V13H11M20 9V11H13V9H20M11 9V11H4V9H11M20 5V7H13V5H20M11 5V7H4V5H11Z"/>
                          </svg>
                          <span className="guide-name">{application.assignedAdvisor?.name || "Unknown Advisor"}</span>
                        </div>
                        <div className="guide-details">
                          <p><span>Email:</span> {application.assignedAdvisor?.email || "N/A"}</p>
                          <p><span>Phone:</span> {application.assignedAdvisor?.phoneNumber || "N/A"}</p>
                          <p><span>Department:</span> {application.assignedAdvisor?.department || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {application.assignedUsers && application.assignedUsers.length > 0 && (
                <div className="detail-group">
                  <div className="detail-item">
                    <label>Assigned Guides</label>
                    <div className="assigned-guides">
                      {application.assignedUsers.map((user, index) => (
                        <div key={index} className="guide-item">
                          <div className="guide-header">
                            <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                              <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                            </svg>
                            <span className="guide-name">{user.name || "Unknown Guide"}</span>
                          </div>
                          <div className="guide-details">
                            <p><span>Email:</span> {user.email || "N/A"}</p>
                            <p><span>Phone:</span> {user.phoneNumber || "N/A"}</p>
                            <p><span>Major:</span> {user.major || "N/A"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}



              /*FOR DEBUGGING, show applied users*/
              {!isFair && application.__t === 'IndividualTour' && application.appliedUsers && application.appliedUsers.length > 0 && (
                <div className="detail-group">
                  <div className="detail-item">
                    <label>Applied Guides</label>
                    <div className="assigned-guides">
                      {application.appliedUsers.map((user, index) => (
                        <div key={index} className="guide-item">
                          <div className="guide-header">
                            <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                              <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                            </svg>
                            <span className="guide-name">{user.name || "Unknown Guide"}</span>
                          </div>
                          <div className="guide-details">
                            <p><span>Email:</span> {user.email || "N/A"}</p>
                            <p><span>Phone:</span> {user.phoneNumber || "N/A"}</p>
                            <p><span>Major:</span> {user.major || "N/A"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="detail-group">
                <div className="detail-item">
                  <label>{isFair ? 'Fair Date' : 'Visit Date'}</label>
                  <p className="datetime">
                    <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                      <path fill="currentColor" d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                    </svg>
                    {new Date(isFair ? application.fairDate : application.visitDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="detail-item">
                  <label>{isFair ? 'Fair Time' : 'Visit Time'}</label>
                  <p className="datetime">
                    <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                      <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                    </svg>
                    {isFair ? application.fairTime : application.visitTime}
                  </p>
                </div>
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
                      <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                        <path fill="currentColor" d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                      </svg>
                      {new Date(application.applicationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${application.status}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
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