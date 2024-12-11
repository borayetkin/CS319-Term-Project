import React, { useState } from 'react';


const DatePicker2 = ({ onDateChange, onMonthChange, size = 'large' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  const isDisabled = (date) => {
    // Check if the date is a weekend (Saturday or Sunday)
    if (date <= twoWeeksFromNow) {
    return true;
  };
  }

  const daysArray = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    // ${daysArray[date.getDay()]} for day name
    return `${year}-${month}-${day}`;
  };
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const days = [];
    let currentDay = new Date(firstDayOfMonth);

    // Add days before the start of the month to align with weekdays
    while (currentDay.getDay() !== 0) {
      currentDay.setDate(currentDay.getDate() - 1);
      days.unshift(new Date(currentDay));
    }

    currentDay = new Date(firstDayOfMonth);
    while (currentDay <= lastDayOfMonth) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    // Add trailing days to complete the week
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
      onMonthChange(date);
    }
    setSelectedDate(date);
    setIsOpen(false);
    onDateChange && onDateChange({target : {name : "visitDate", value : formatLocalDate(date)}});

  };

  const changeMonth = (offset) => {

    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
    onMonthChange && onMonthChange(newDate);
  };

  return (

        
        <div className={`custom-date-picker ${size}`}>
        <input
          
          readOnly
          name='visitDate'
          style={{"cursor" : "pointer" , "caret-color": "transparent"}}
          value={selectedDate ? formatLocalDate(selectedDate) : ""}
          onClick={() => setIsOpen(!isOpen)}

          placeholder="Select a date"
          required // Really Important, Do not delete
        />
        {isOpen && (

          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => changeMonth(-1)} type='button'>❮</button>
              <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => changeMonth(1)} type='button'>❯</button>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div className="day-name" key={day}>
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((date, index) => (
                <div
                  key={index}
                  className={`day ${date.getMonth() === currentDate.getMonth() ? 'current-month' : 'other-month'} ${
                    selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
                  } ${isDisabled(date) ? 'disabled' : ''}`}
                  onClick={() => handleDateSelect(date)}
                >
                  {date.getDate()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      

  );
};

export default DatePicker2;