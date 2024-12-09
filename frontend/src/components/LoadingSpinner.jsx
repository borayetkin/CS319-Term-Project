const LoadingSpinner = ({loading = "Events"}) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-text">Loading {loading}...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 