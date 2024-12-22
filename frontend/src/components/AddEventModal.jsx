import ReactDOM from "react-dom";

const AddEventModal = ({ slot, onClose }) => {
  if (!slot) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-event-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Add Event</h3>
        <p>
          Day: {slot.slotDay}, Time: {slot.slotTime}
        </p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.getElementById("modal-root") // Ensure this is in index.html
  );
};

export default AddEventModal;

