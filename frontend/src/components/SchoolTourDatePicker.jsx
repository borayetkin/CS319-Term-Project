import React, { useState, useEffect } from "react";
import "../styles/CustomDatePicker.css"
import "../styles/TourApplication.css";
import DatePicker2 from "./DatePicker2";
const CustomDateTimePicker = ({handleChange}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [applications, setApplications] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTimeSelectionOpen, setIsTimeSelectionOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null);
  const fetchDateCounts = async (date) => {
    try {
      // Replace with your API call
    const response = await fetch(`http://localhost:3000/api/events/shcooltours/dates?month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
   
    
    const data = await response.json();

    
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchDateCounts(currentDate);
  }, [currentDate]);
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const handleDateChange = (e) => {
    handleChange(e)
    setSelectedDate(new Date(e.target.value));
    setSelectedTime("")
  };

  const getAvailability = (time,date) => {
    if (!date) return "white";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`
    const key = `${dateStr}-${time}`;
    const count = applications[key] || 0;
    if (count >= 3) return "disabled";
    return count === 0 ? "white" : count === 1 ? "yellow" : "red";
  };

  const renderTimeSlots = (date) => {
    const times = ["09:00", "11:00", "13:30", "16:00"];
    return times.map((time) => {
      const availability = getAvailability(time,date);

      
    return (

      <button
        type="button"
        key={time}
        className={`time-slot ${selectedTime === time ? 'selected' : availability}`}
        disabled={availability === "disabled"}
        onClick={() => {
          handleChange({target : {name : "visitTime", value : time}});
          setIsTimeSelectionOpen(!isTimeSelectionOpen)
          setSelectedTime(time);
        }}
      >
        {time}
      </button>
    );
    });
  };

  return (
    <>
        <label htmlFor="visitDate">Visit Date:</label>
        <div className="">
        <DatePicker2
        onDateChange={handleDateChange}
        onMonthChange={(date) => setCurrentDate(date)}
        />
        </div>
        <p className="restriction-message">
          *Sadece bugünden iki hafta sonraki tarihler seçilebilir. 

        </p>
        <p className="restriction-message">
          *Seçtiğiniz tarih ve saate göre Üniversitemizde yoğunluk seviyesi değişkenlik gösterebilir. 
        </p>
     
        <label htmlFor="visitTime">Visit Time:</label>
        <input type="text" 
        readOnly
        name="visitTime"
        style={{"cursor" : "pointer" , "caret-color": "transparent"}}
        
        placeholder="Select a Time"
        onClick={() => setIsTimeSelectionOpen(!isTimeSelectionOpen)}
        value={selectedTime ? selectedTime : ""}
        required // Really Important, Do not delete
        />
        {isTimeSelectionOpen  &&
        (<>
        <div className="time-slots">{renderTimeSlots(selectedDate)}</div>
        <p className="restriction-message">
          *Sarı:Orta Yoğunluk. Kırmızı: Yüksek Yoğunluk.
        </p>
        </>)
}
    </>
        
  );
};

export default CustomDateTimePicker;
