import React, { useState, useEffect } from "react";
import styles from "../styles/GuideFinder.module.css";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const GuideFinder = ({ eventOrFair, onClose, assignGuide, unassignGuide }) => {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [guidesPerPage] = useState(5);
  const [isFilteredByTime, setIsFilteredByTime] = useState(false);

  useEffect(() => {
    fetchGuides();
  }, []);

  useEffect(() => {
    filterGuides();
  }, [searchQuery, guides, isFilteredByTime]);
  const isUserAssigned = (guideId) => {
    return eventOrFair.assignedUsers.some((user) => user._id === guideId);
  };
  const fetchGuides = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/guides", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setGuides(data);
      setFilteredGuides(data);
    } catch (error) {
      console.error("Error fetching guides:", error);
    }
  };
  const checkIfTimeIsBetweenTimeSlot = (time, timeSlot) => {

    const [start, end] = timeSlot.split("-");
    return time >= start && time <= end;
    };
  const checkAvailabilityMatch =(availability, eventOrFair) => {
    
    const eventDay = new Date(eventOrFair.visitDate || eventOrFair.fairDate).getDay();
    const eventDayString = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][eventDay];
    console.log(eventDay);
    const isDayAvailable =availability.day === eventDayString;
    const isTimeAvailable = availability.timeSlots.some((timeSlot) => checkIfTimeIsBetweenTimeSlot(eventOrFair.visitTime, timeSlot));
    return isDayAvailable && isTimeAvailable;
  };
  const canNotifyGuide = (guide) => {
    return !isUserAssigned(guide._id)&& guide.availability.some((availability) => checkAvailabilityMatch(availability, eventOrFair));
  };
  const filterGuides = () => {
    let filtered = guides;

    if (searchQuery) {
      filtered = guides.filter((guide) =>
        guide.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (isFilteredByTime && eventOrFair.visitTime) {
      filtered = filtered.filter((guide) =>
        guide.availability.some((availability) =>
            checkAvailabilityMatch(availability, eventOrFair)
        )
      );
    }

    setFilteredGuides(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAction = (guideId) => {
    if (isSchoolTour) {
      notifyGuide(guideId);
    } else {
      assignGuide(guideId);
    }
    onClose();
  };

  const notifyGuide = async (guideId) => {
    try {
      await fetch(`http://localhost:3000/api/events/notify-guide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ guideId, eventId: eventOrFair._id }),
      });
    } catch (error) {
      console.error("Error notifying guide:", error);
    }
  };

  const handleAssignGuide = async (eventId, guideId) => {
    if (checkIfUserHasApplied(guideId)) {
      await assignGuide(eventId, guideId);
    }
  };

  const handleUnassignGuide = async (eventId, guideId) => {
    await unassignGuide(eventId, guideId);
    setGuides((prevGuides) =>
      prevGuides.map((guide) =>
        guide._id === guideId ? { ...guide, assigned: false } : guide
      )
    );
  };

  const handleNotifyGuide = async (guideId) => {
    await notifyGuide(guideId);
    setGuides((prevGuides) =>
      prevGuides.map((guide) =>
        guide._id === guideId ? { ...guide, notified: true } : guide
      )
    );
  };

  const indexOfLastGuide = currentPage * guidesPerPage;
  const indexOfFirstGuide = indexOfLastGuide - guidesPerPage;
  const currentGuides = filteredGuides.slice(indexOfFirstGuide, indexOfLastGuide);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredGuides.length / guidesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const isSchoolTour = eventOrFair.typeStr && eventOrFair.__t === "SchoolTour";
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFilterByTime = () => {
    setIsFilteredByTime(true);
    filterGuides();
  };

  const handleResetFilter = () => {
    setIsFilteredByTime(false);
    setFilteredGuides(guides);
  };
  const checkEventIsFull = () => {
    return eventOrFair.assignedUsers.length >= eventOrFair.requiredNumberOfGuides;
  };
  const checkIfUserHasApplied = (userID) => {
    return eventOrFair.appliedUsers?.some((appliedUser) => appliedUser._id === userID);
  };

  const sortedGuides = [...filteredGuides].sort((a, b) => {
    const aAssigned = isUserAssigned(a._id);
    const bAssigned = isUserAssigned(b._id);
    const aApplied = checkIfUserHasApplied(a._id);
    const bApplied = checkIfUserHasApplied(b._id);
    const aNotifiable = canNotifyGuide(a);
    const bNotifiable = canNotifyGuide(b);
    if (aAssigned !== bAssigned) return bAssigned - aAssigned;
    if (aApplied !== bApplied) return bApplied - aApplied;
    if (aNotifiable !== bNotifiable) return bNotifiable - aNotifiable;
    return 0;
  });

  const getType = (eventOrFair) => {
    if (eventOrFair.typeStr) {
      return eventOrFair.typeStr;
    } else return "Fair";
  };
  return (
    <div className={styles.guideFinderOverlay}>
      <div className={styles.guideFinderModal}>
        <button className={styles.closeButton} onClick={onClose}>
          X
        </button>
        <h2>Find a Guide</h2>
        <div>
          <label>
            Type:
            <input
              type="text"
              value={getType(eventOrFair)}
              readOnly
              className={styles.readOnlyInput}
            />
          </label>
        </div>
        <input
          type="text"
          placeholder="Search guides..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div>
          <button className={styles.filterButton} onClick={handleFilterByTime}>
            Filter by Time
          </button>
          <button className={styles.resetFilterButton} onClick={handleResetFilter}>
            Reset Filter
          </button>
        </div>
        <ul>
          {sortedGuides.slice(indexOfFirstGuide, indexOfLastGuide).map((guide) => (
            <li key={guide._id}>
              <span>{guide.name}</span>
              {!isUserAssigned(guide._id) ? (
                checkIfUserHasApplied(guide._id) &&
                !checkEventIsFull() && (
                  <button
                    className={styles.assignButton}
                    onClick={() => handleAssignGuide(eventOrFair._id, guide._id)}
                  >
                    <PersonAddIcon /> Assign
                  </button>
                )
              ) : (
                <button
                  className={styles.unassignButton}
                  onClick={() => handleUnassignGuide(eventOrFair._id, guide._id)}
                >
                  <PersonRemoveIcon /> Unassign
                </button>
              )}
              {isSchoolTour && !guide.notified && canNotifyGuide(guide) && (
                <button
                  className={styles.notifyButton}
                  onClick={() => handleNotifyGuide(guide._id)}
                >
                  <NotificationsActiveIcon /> Notify
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className={styles.pagination}>
          <button className={styles.iconButton} onClick={prevPage}>
            &laquo;
          </button>
          {[...Array(Math.ceil(filteredGuides.length / guidesPerPage)).keys()].map(
            (number) => (
              <button key={number} onClick={() => paginate(number + 1)}>
                {number + 1}
              </button>
            )
          )}
          <button className={styles.iconButton} onClick={nextPage}>
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideFinder;
