import "../styles/components/DetailsModal.css";

const DetailsModal = ({ application, onClose }) => {
  if (!application) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Application Details</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="details-grid">
          {application.__t === "SchoolTour" ? (
            <>
              <div className="detail-group">
                <div className="detail-item">
                  <label>School Name</label>
                  <p>{application.schoolName || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>School Priority</label>
                  <span className={`priority-badge ${application.applicant.priority?.toLowerCase() || 'na'}`}>
                    {application.applicant.priority || "N/A"}
                  </span>
                </div>

                <div className="detail-item">
                  <label>City</label>
                  <p>{application.city || "N/A"}</p>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Primary Visit Date</label>
                  <p className="datetime">
                    <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                      <path fill="currentColor" d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                    </svg>
                    {new Date(application.visitDate).toLocaleDateString()}
                    <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
                      <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                    </svg>
                    {application.visitTime || "N/A"}
                  </p>
                </div>

                {application.reserveDates?.length > 0 && (
                  <div className="detail-item">
                    <label>Alternative Dates</label>
                    <div className="alt-dates">
                      {application.reserveDates.map((date, index) => (
                        <p key={index} className="datetime">
                          <i className="far fa-calendar"></i>
                          {new Date(date.visitDate).toLocaleDateString()}
                          <i className="far fa-clock"></i>
                          {date.visitTime || "N/A"}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Student Count</label>
                  <p>{application.studentCount || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Contact Person</label>
                  <p>{application.contactPerson || "N/A"}</p>
                </div>
              </div>

              <div className="detail-group contact-info">
                <div className="detail-item">
                  <label>Email</label>
                  <p><i className="far fa-envelope"></i>{application.email || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Phone Number</label>
                  <p><i className="fas fa-phone"></i>{application.phoneNumber || "N/A"}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="detail-group">
                <div className="detail-item">
                  <label>Student Name</label>
                  <p>{application.studentName || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Student High School</label>
                  <p>{application.studentHighSchool || "N/A"}</p>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Visit Date</label>
                  <p className="datetime">
                    <i className="far fa-calendar"></i>
                    {new Date(application.visitDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="detail-item">
                  <label>Visit Time</label>
                  <p className="datetime">
                    <i className="far fa-clock"></i>
                    {application.visitTime || "N/A"}
                  </p>
                </div>
              </div>

              <div className="detail-group contact-info">
                <div className="detail-item">
                  <label>Email</label>
                  <p><i className="far fa-envelope"></i>{application.applicant.email || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Phone Number</label>
                  <p><i className="fas fa-phone"></i>{application.applicant.phoneNumber || "N/A"}</p>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <label>Major of Interest</label>
                  <p>{application.majorOfInterest || "N/A"}</p>
                </div>
              </div>
            </>
          )}

          <div className="detail-group">
            <div className="detail-item">
              <label>Status</label>
              <span className={`status-badge ${application.status}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>

            <div className="detail-item notes">
              <label>Additional Notes</label>
              <p>{application.additionalNotes || "No additional notes"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;