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

  startOfTheWeek.setHours(0, 0, 0, 0);
  const endOfTheWeek = new Date(startOfTheWeek);
  endOfTheWeek.setDate(endOfTheWeek.getDate() + 4);
  endOfTheWeek.setHours(23, 59, 59, 999);

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
      status: "pending" ,
      __t: "SchoolTour"
    }).populate("applicant");
    
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
    
    if (new Date(reservedDate.visitDate) >= new Date(weeklySchedule.weekBeginning) &&
        new Date(reservedDate.visitDate) <= new Date(weeklySchedule.weekEnding)) {

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

async function getCurrentMonday() {
  const now = new Date();
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Adjust to the most recent Monday
  currentMonday.setHours(0, 0, 0, 0);
  return currentMonday;
}

exports.getWeeklySchedules = async (req, res) => {
  try {
    const currentMonday = await getCurrentMonday();

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

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching weekly schedules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.loadWeeklySchedules = async (req, res) => {
  try {
    const currentMonday = await getCurrentMonday();

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

exports.removeEventFromSchedule = async (req, res) => {
  const {eventId} = req.body;

  try {

    // Find the weekly schedule containing the event
    const schedule = await WeeklySchedule.findOne({
      "slots.event": eventId,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule containing the event not found." });
    }

    // Find and update the slot containing the event
    const slot = schedule.slots.find(
      (s) => s.event && s.event.toString() === eventId
    );

    if (slot) {
      slot.event = null; // Remove event from slot
      slot.isEmpty = true; // Mark slot as empty
    }

    await schedule.save();

    // Update the event status to "pending"
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    event.status = "pending";
    await event.save();

    return res.status(200).json({
      message: "Event removed from schedule.",
    });
  } catch (error) {
    console.error("Error removing event from schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMatchingEventsForSlot = async (req, res) => {
  try {
    const { weekBeginning, slotDay, slotTime } = req.body;

    if (!weekBeginning || !slotDay || !slotTime) {
      return res.status(400).json({ message: "Missing required parameters." });
    }

    
    // Convert weekBeginning to a Date object
    const weekStartDate = new Date(weekBeginning);
    weekStartDate.setHours(0, 0, 0, 0);

    
    // Locate the weekly schedule with the given weekBeginning
    const schedule = await WeeklySchedule.findOne({ weekBeginning: weekStartDate });
    if (!schedule) {
      return res.status(404).json({ message: "No matching weekly schedule found." });
    }

    // Find all events with status 'pending'
    const pendingEvents = await Event.find({
      status: "pending" ,
      __t: "SchoolTour"
    });

    // Filter events to match those with a reserveDate matching the slot's date
    const matchingEvents = pendingEvents.filter((event) =>
      event.reserveDates.some((date) => {
        const visitDate = new Date(date.visitDate);
        const weekStart = new Date(schedule.weekBeginning);
        const weekEnd = new Date(schedule.weekEnding);
        const visitDay = date.visitDate.toLocaleDateString("en-US", { weekday: "long" });
        const visitTime = date.visitTime;
        return (
          visitDate >= weekStart &&
          visitDate <= weekEnd &&
          visitDay === slotDay &&
          visitTime === slotTime
        );
      })
    );

    // Extract the schoolName properties of matching events
    const schoolNames = matchingEvents.map((event) => event.schoolName || "Unnamed School");

    return res.status(200).json(schoolNames);
  } catch (error) {
    console.error("Error in getMatchingEventsForSlot:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.assignEventToSlot = async (req, res) => {
  const { schoolName, weekBeginning, slotDay, slotTime } = req.body;

  try {
    // Find the event with the matching schoolName
    const event = await Event.findOne({ schoolName: schoolName });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find the weekly schedule that matches the provided weekBeginning
    const weeklySchedule = await WeeklySchedule.findOne({ weekBeginning: new Date(weekBeginning) });

    if (!weeklySchedule) {
      return res.status(404).json({ message: "Weekly schedule not found" });
    }

    // Find the slot in the weekly schedule matching slotDay and slotTime
    const slot = weeklySchedule.slots.find(
      (s) => s.slotDay === slotDay && s.slotTime === slotTime
    );

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check if the slot is already occupied
    if (!slot.isEmpty) {
      return res.status(400).json({ message: "Slot is already occupied" });
    }

    // Assign the event ID to the slot and update the event status
    slot.event = event._id;
    slot.isEmpty = false;
    event.status = "scheduled";

    // Save the updated weekly schedule and event
    await weeklySchedule.save();
    await event.save();

    return res.status(200).json({ message: "Event successfully assigned to the slot" });
  } catch (error) {
    console.error("Error assigning event to slot:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

