const DetailsModal = ({ application, onClose }) => {
    if (!application) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
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
                  <p>{application.applicant.priority || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>City:</label>
                  <p>{application.city || "N/A"}</p>
                </div>

                <div className="detail-item">
                  <label>Primary Visit Date:</label>
                  <p>{new Date(application.visitDate).toLocaleDateString()} at {application.visitTime || "N/A"}</p>
                </div>

                {application.reserveDates?.length > 0 && (
                  <div className="detail-item full-width">
                    <label>Alternative Dates:</label>
                    <div>
                      {application.reserveDates.map((date, index) => (
                        <p key={index}>
                          {new Date(date.visitDate).toLocaleDateString()} at {date.visitTime || "N/A"}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

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

          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  };
  export default DetailsModal;