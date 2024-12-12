import React, { useState, useEffect } from "react";
import "../styles/CustomDatePicker.css";
import "../styles/TourApplication.css";
import { FaTimes, FaRedo } from "react-icons/fa"; // Import FaRedo icon

const CustomDateTimePicker = ({ handleChange ,reserveDatesImp }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [applications, setApplications] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTimeSelectionOpen, setIsTimeSelectionOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reserveDates, setReserveDates] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const fetchDateCounts = async (date) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/events/shcooltours/dates?month=${
          date.getMonth() + 1
        }&year=${date.getFullYear()}`
      );
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchDateCounts(currentDate);
    setReserveDates(reserveDatesImp);
  }, [currentDate]);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getAvailability = (time, date) => {
    if (!date) return "white";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const key = `${dateStr}-${time}`;
    const count = applications[key] || 0;
    if (count >= 3) return "disabled";
    return count === 0 ? "white" : count === 1 ? "yellow" : "red";
  };

  const renderTimeSlots = (date) => {
    const times = ["09:00", "11:00", "13:30", "16:00"];
    return times.map((time) => {
      const availability = getAvailability(time, date);
      return (
        <button
          type="button"
          key={time}
          className={`time-slot ${availability}`}
          disabled={availability === "disabled"}
          onClick={() => handleCompleteSelection(date, time)}
        >
          {time}
        </button>
      );
    });
  };
  const handleCompleteSelection = (date, time) => {
    const newReserveDates = [
      ...reserveDates,
      { date: formatLocalDate(date), time },
    ];
    if (newReserveDates.length > 4) {
      newReserveDates.shift();
    }
    handleOnChange(newReserveDates[0], newReserveDates);
    setReserveDates(newReserveDates);
    setIsTimeSelectionOpen(false);
  };
  const resetSelections = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setReserveDates([]);
    setIsTimeSelectionOpen(false);
    handleChange({
      target: {
        name: "combinedDateTimeUpdate",
        value: {
          visitDate: "",
          visitTime: "",
          reserveDates: [],
        },
      },
    });
  };

  const popupStyles = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
  };

  const overlayStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  };

  const closeButtonStyles = {
    position: "absolute",
    top: "10px",
    right: "10px",
    cursor: "pointer",
  };

  const reservedDateStyles = {
    backgroundColor: "#FFFFE0", // Light yellow background
    padding: "5px",
    margin: "5px 0",
    borderRadius: "5px",
  };

  const resetButtonStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    border: "none",
    color: "black",

    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "16px",
  };

  const resetIconStyles = {
    marginRight: "5px",
  };

  const today = new Date();
  const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const reservedStyle = {
    backgroundColor: "lightyellow",
    color: "black",
    pointerEvents: "none",
  };
  const isDisabled = (date) => {
    if (date <= twoWeeksFromNow) {
      return true;
    }
    return false;
  };
  const handleOnChange = (date, reserveDates) => {
    console.log("date: ", date);

    handleChange({
      target: {
        name: "combinedDateTimeUpdate",
        value: {
          visitDate: date.date,
          visitTime: date.time,
          reserveDates: reserveDates,
        },
      },
    });
  };
  const isAlreadyReserved = (date) => {
    if (
      reserveDates.some((reserve) => reserve.date === formatLocalDate(date))
    ) {
      return true;
    }
    if (currentDate.date === formatLocalDate(date)) {
      return true;
    }
    return false;
  };

  const daysArray = [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ];

  const getDateAvailability = (date) => {
    const formattedDate = formatLocalDate(date);
    const totalTours = Object.keys(applications).reduce((acc, key) => {
      if (key.startsWith(formattedDate)) {
        acc += applications[key];
      }
      return acc;
    }, 0);

    if (totalTours > 7) return "disabled";
    if (totalTours > 5) return "red";
    if (totalTours > 3) return "yellow";
    return "";
  };

  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const days = [];
    let currentDay = new Date(firstDayOfMonth);

    while (currentDay.getDay() !== 0) {
      currentDay.setDate(currentDay.getDate() - 1);
      days.unshift(new Date(currentDay));
    }

    currentDay = new Date(firstDayOfMonth);
    while (currentDay <= lastDayOfMonth) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    while (days.length % 7 !== 0) {
      const nextDay = new Date(days[days.length - 1]);
      nextDay.setDate(nextDay.getDate() + 1);
      days.push(nextDay);
    }

    return days;
  };

  const handleDateSelect = (date) => {
    if (isDisabled(date)) return;

    const previousMonth = selectedDate ? selectedDate.getMonth() : null;
    if (previousMonth !== null && previousMonth !== date.getMonth()) {
      setCurrentDate(date);
    }
    setSelectedDate(date);
    setIsTimeSelectionOpen(true); // Ensure time selection opens when a date is selected
  };

  const changeMonth = (offset) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + offset,
      1
    );
    setCurrentDate(newDate);
  };

  return (
    <>
      
      <div className={`custom-date-picker large`}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignContent: "center",
            }}
          >
            <h3 style={{ alignSelf: "center" }}>Reserved Dates:</h3>{" "}
            <button
              type="button"
              onClick={resetSelections}
              style={resetButtonStyles}
            >
              <FaRedo style={resetIconStyles} /> Reset
            </button>
          </div>
          {reserveDates.length > 0 ? (
            reserveDates.map((reserve, index) => (
              <div key={index} style={reservedDateStyles}>
                {reserve.date} - {reserve.time}
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
        {isOpen && (
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => changeMonth(-1)} type="button">
                ❮
              </button>
              <span>
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button onClick={() => changeMonth(1)} type="button">
                ❯
              </button>
            </div>
            <div className="calendar-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div className="day-name" key={day}>
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((date, index) => {
                const availability = getDateAvailability(date);
                return (
                  <div
                    key={index}
                    className={`day ${
                      date.getMonth() === currentDate.getMonth()
                        ? "current-month"
                        : "other-month"
                    } ${
                      selectedDate &&
                      date.toDateString() === selectedDate.toDateString()
                        ? "selected"
                        : ""
                    } ${isDisabled(date) ? "disabled" : ""} ${availability}`}
                    style={isAlreadyReserved(date) ? reservedStyle : {}}
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <p className="restriction-message">
        *Sadece bugünden iki hafta sonraki tarihler seçilebilir.
      </p>
      <p className="restriction-message">
        *Seçtiğiniz tarih ve saate göre Üniversitemizde yoğunluk seviyesi
        değişkenlik gösterebilir.
      </p>
      <p className="restriction-message">
        *Sarı:Orta Yoğunluk. Kırmızı: Yüksek Yoğunluk.
      </p>

      {isTimeSelectionOpen && (
        <>
          <div
            style={overlayStyles}
            onClick={() => setIsTimeSelectionOpen(false)}
          ></div>
          <div style={popupStyles}>
            <FaTimes
              style={closeButtonStyles}
              onClick={() => setIsTimeSelectionOpen(false)}
            />
            Select A Time Slot:
            <div className="time-slots">{renderTimeSlots(selectedDate)}</div>
            <p className="restriction-message">
              *Sarı:Orta Yoğunluk. Kırmızı: Yüksek Yoğunluk.
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default CustomDateTimePicker;
