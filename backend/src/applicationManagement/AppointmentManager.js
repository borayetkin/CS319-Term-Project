const mongoose = require("mongoose");
const WeeklySchedule = require("./WeeklySchedule");
const Applicant = require("../models/Applicant");
const Event = require("../models/Event");
const { markEventAsCanceled } = require("../controllers/EventController");

// Create a weekly schedule and populate the slots in it
async function createWeeklySchedule(startOfTheWeek) {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00', '11:00', '13:30', '16:00'];

  const slots = [];

  // Create slots for each weekday and each time
  for (let day of weekdays) {
    for (let time of times) {
      const slot = {
        slotDay: day,
        slotTime: time,
        isEmpty: true,
        event: null,
      };
      slots.push(slot);
    }
  }

  startOfTheWeek.setUTCHours(0, 0, 0, 0);
  const endOfTheWeek = new Date(startOfTheWeek);
  endOfTheWeek.setDate(endOfTheWeek.getDate() + 4);
  endOfTheWeek.setUTCHours(23, 59, 59, 999);

  // Create the weekly schedule object
  const weeklySchedule = new WeeklySchedule({
    weekBeginning: startOfTheWeek,
    weekEnding: endOfTheWeek,
    slots: slots,
  });

  await weeklySchedule.save();
  return weeklySchedule;
}

// Assign events to available slots in the weekly schedule
async function assignEventsToSlots(startOfTheWeek) {
  try {
    let weeklySchedule = await WeeklySchedule.findOne({ weekBeginning: startOfTheWeek });

    if (!weeklySchedule) {
      weeklySchedule = await createWeeklySchedule(startOfTheWeek);
    }

    const allEvents = await Event.find({
      status: "pending",
      __t: "SchoolTour",
    }).populate("applicant");

    console.log(allEvents.length);
    
    const filteredEvents = allEvents.filter((event) =>
      event.reserveDates.some((date) => {
        const visitDate = new Date(date.visitDate);
        return (
          visitDate >= new Date(weeklySchedule.weekBeginning) &&
          visitDate <= new Date(weeklySchedule.weekEnding)
        );
      })
    );

    const sortedEvents = await sortEventsByPriority(filteredEvents);

    let notPlacedEvents = [];
    for (const event of sortedEvents) {
      const isPlaced = await placeToAvailableSlot(event, weeklySchedule);
      if (!isPlaced) notPlacedEvents.push(event);
    }

    const remainingEvents = await Promise.all(
      notPlacedEvents.map(async (anEvent) => {
        const hasFutureDate = await hasFutureReserveDate(anEvent, weeklySchedule);
        return hasFutureDate ? null : anEvent;
      })
    ).then((events) => events.filter((event) => event !== null));

    const notReplacedEvents = await checkLastChances(remainingEvents, weeklySchedule);

    await cancelEvents(notReplacedEvents);
    await updateEventStatus(weeklySchedule);

    return weeklySchedule;
  } catch (error) {
    console.error("Error assigning events to slots:", error);
  }
}

async function sortEventsByPriority(events) {
  const priorityMap = {
    High: 3,
    Medium: 2,
    General: 1,
  };

  return events.sort((a, b) => {
    const priorityA = priorityMap[a.applicant.priority] + a.cancellationTimes / 2;
    const priorityB = priorityMap[b.applicant.priority] + b.cancellationTimes / 2;

    console.log(priorityMap[a.applicant.priority] + "  vs  " + priorityMap[b.applicant.priority])

    const priorityDiff = priorityB - priorityA;
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return a.reserveDates.length - b.reserveDates.length;
  });
}

async function placeToAvailableSlot(event, weeklySchedule) {
  for (const reservedDate of event.reserveDates) {
    const visitDay = reservedDate.visitDate.toLocaleDateString("en-US", { weekday: "long" });
    const visitTime = reservedDate.visitTime;

    const slot = weeklySchedule.slots.find(
      (slot) => slot.slotDay === visitDay && slot.slotTime === visitTime && slot.isEmpty
    );

    if (slot) {
      slot.event = event._id;
      slot.isEmpty = false;
      await weeklySchedule.save();
      return true;
    }
  }

  return false;
}

async function hasFutureReserveDate(event, weeklySchedule) {
  return event.reserveDates.some((reservedDate) =>
    new Date(reservedDate.visitDate) > new Date(weeklySchedule.weekEnding)
  );
}

async function checkLastChances(remainingEvents, weeklySchedule) {
  let notReplacedEvents = [...remainingEvents];

  for (const event of remainingEvents) {
    for (const reservedDate of event.reserveDates) {
      const visitDay = reservedDate.visitDate.toLocaleDateString("en-US", { weekday: "long" });
      const visitTime = reservedDate.visitTime;

      const slot = weeklySchedule.slots.find((slot) => slot.slotDay === visitDay && slot.slotTime === visitTime);

      if (slot && slot.isEmpty) {
        slot.event = event._id;
        slot.isEmpty = false;
        await weeklySchedule.save();
        notReplacedEvents = notReplacedEvents.filter((e) => e._id !== event._id);
        break;
      }
    }
  }

  return notReplacedEvents;
}

async function cancelEvents(events) {
  for (const event of events) {
    event.status = "canceled-resubmission-requested";
  }
}

async function updateEventStatus(weeklySchedule) {
  for (const slot of weeklySchedule.slots) {
    if (slot.event) {
      const event = await Event.findById(slot.event);
      if (event) {
        event.status = "scheduled";
        await event.save();
      }
    }
  }
}

exports.getWeeklySchedules = async (req, res) => {
  try {
    const now = new Date();
    const currentMonday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    currentMonday.setUTCHours(0, 0, 0, 0);

    const weeklyDates = [];
    for (let i = 2; i <= 7; i++) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(weekStart.getDate() + i * 7);
      weeklyDates.push(weekStart);
    }

    const schedules = [];
    for (const date of weeklyDates) {
      const currentSchedule = await assignEventsToSlots(date);

      schedules.push(await currentSchedule.populate({
        path: "slots",
        populate: {
          path: "event",
          model: "Event", // Ensure this matches the name of your Event model
        },
      }));
    }
    console.log(schedules);

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching weekly schedules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.loadWeeklySchedules = async (req, res) => {
  try {
    const now = new Date();
    const currentMonday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    currentMonday.setUTCHours(0, 0, 0, 0);

    const weeklyDates = [];
    for (let i = 2; i <= 7; i++) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(weekStart.getDate() + i * 7);
      weeklyDates.push(weekStart);
    }

    const schedules = [];
    for (const date of weeklyDates) {
      let weeklySchedule = await WeeklySchedule.findOne({ weekBeginning: date });
      
      if (!weeklySchedule) {
        weeklySchedule = await assignEventsToSlots(date);
      }

      schedules.push(await weeklySchedule.populate({
        path: "slots",
        populate: {
          path: "event",
          model: "Event", // Ensure this matches the name of your Event model
        },
      }));
    }
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching weekly schedules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
