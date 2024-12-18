const mongoose = require("mongoose");
const WeeklySchedule = require("./WeeklySchedule");
const Applicant = require("../models/Applicant");
const Event = require("../models/Event");

const { sendCancelationEmail } = require("../config/EmailService");

// Create a weekly schedule and populate the slots in it
async function createWeeklySchedule(startOfTheWeek) {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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
  endOfTheWeek.setDate(endOfTheWeek.getDate() + 6);
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

    const eventsToCancel = await checkLastChances(remainingEvents, weeklySchedule);

    await cancelEvents(eventsToCancel);

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
    ANKARA: 0.5,
  };

  return events.sort((a, b) => {
    const priorityA = priorityMap[a.applicant.priority] + a.cancellationTimes / 2;
    const priorityB = priorityMap[b.applicant.priority] + b.cancellationTimes / 2;

    if (a.city !== "ANKARA") {
      priorityA += 0.5;
    }
    if (b.city !== "ANKARA") {
      priorityB += 0.5;
    }

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
        await assignEventToSlot(event, slot, weeklySchedule);
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

/**
 * Recursively finds an empty slot for an event and places it there,
 * shifting other events if necessary.
 * @param {Object} event - The event to be placed.
 * @param {Object} weeklySchedule - The weekly schedule containing slots.
 * @param {Function} populateEvent - A function to populate the slot's event.
 * @param {Set} visitedSlots - Tracks slots already visited to prevent revisits.
 * @returns {Boolean} - Returns true if the event was successfully placed.
 */
async function replaceEventsRecursively(event, weeklySchedule, visitedSlots = new Set()) {
  for (const reservedDate of event.reserveDates) {
    const visitDay = new Date(reservedDate.visitDate).toLocaleDateString("en-US", { weekday: "long" });
    const visitTime = reservedDate.visitTime;

    // Find the corresponding slot
    const slot = weeklySchedule.slots.find(
      (s) => s.slotDay === visitDay && s.slotTime === visitTime
    );

    if (!slot || visitedSlots.has(slot)) continue; // Skip if slot does not exist or is already visited

    visitedSlots.add(slot); // Mark this slot as visited

    if (slot.isEmpty) {
      // If slot is empty, place the event and return success
      await assignEventToSlot(event, slot, weeklySchedule);
      return true;
    } else {
      // If slot is not empty, attempt to recursively place the current event
      const currentEvent = slot.event;

      // Recursively attempt to place the current event elsewhere
      const success = await replaceEventsRecursively(currentEvent, weeklySchedule, visitedSlots);

      if (success) {
        // If successfully placed, now assign the new event to the current slot
        await assignEventToSlot(event, slot, weeklySchedule);
        return true;
      }
    }
  }

  // If no suitable slot was found, return false
  return false;
}


async function checkLastChances(remainingEvents, weeklySchedule) {
  const eventsToCancel = [];
  await weeklySchedule.populate({
    path: "slots.event",
    model: "Event",
  });
  
  for (const event of remainingEvents) {
    
    let isScheduled = false;
    for (const reservedDate of event.reserveDates) {
      const visitDay = reservedDate.visitDate.toLocaleDateString("en-US", { weekday: "long" });
      const visitTime = reservedDate.visitTime;

      const slot = weeklySchedule.slots.find((slot) => slot.slotDay === visitDay && slot.slotTime === visitTime);

      isScheduled = await replaceEventsRecursively(event, weeklySchedule);

      // If event still not could not find a place, try to postpone some events
      if (!isScheduled) {
        const slotEventHasFutureDates = await hasFutureReserveDate(slot.event, weeklySchedule);
        if (slotEventHasFutureDates) {
          slot.event.status = "pending";
          await slot.event.save();

          await assignEventToSlot(event, slot, weeklySchedule);

          isScheduled = true;
        }
      }

      if (isScheduled) {
        await weeklySchedule.populate({
          path: "slots.event",
          model: "Event",
        });
        
        break;
      }
    }

    if (!isScheduled) {
      eventsToCancel.push(event);
    }
  }

  return eventsToCancel;
}

async function cancelEvents(events) {
  for (const event of events) {
    event.status = "canceled-resubmission-requested";
    event.cancellationTimes++;
    await event.save()

    event.populate('applicant');
    const resubmissionLink = `http://localhost:5173/resubmit-form/${event._id}`;
    sendCancelationEmail(event.applicant.email, event.schoolName, resubmissionLink);
  }
}

async function getCurrentMonday() {
  const now = new Date();
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Adjust to the most recent Monday
  currentMonday.setHours(0, 0, 0, 0);
  return currentMonday;
}

async function assignEventToSlot(event, slot, weeklySchedule) {

  slot.event = event._id;
  slot.isEmpty = false;
  await weeklySchedule.save();

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const targetDayIndex = daysOfWeek.indexOf(slot.slotDay);

  const weekBeginningDate = new Date(weeklySchedule.weekBeginning);
  const targetDate = new Date(weekBeginningDate);
  targetDate.setDate(weekBeginningDate.getDate() + targetDayIndex);

  event.visitDate = targetDate;
  event.visitTime = slot.slotTime;
  event.status = "scheduled";
  await event.save()
}

exports.removeEventFromSchedule = async (eventId) => {
  try {
    // Find the weekly schedule containing the event
    const schedule = await WeeklySchedule.findOne({
      "slots.event": eventId,
    });

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

    if (!(event.status === "rejected")) {
      event.status = "pending";
    }
    await event.save();
  } catch (error) {
    console.error("Error removing event from schedule:", error);
  }
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
    for (let i = -2; i <= 7; i++) {
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

exports.removeEvent = async (req, res) => {
  const {eventId} = req.body;

  try {
    await this.removeEventFromSchedule(eventId);

    return res.status(200).json({
      message: "Event removed from schedule.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports. getAllEventsAndMatchingSlots = async (req, res) => {
  try {
    const { weekBeginning } = req.query;

    if (!weekBeginning) {
      return res.status(400).json({ message: "Missing required parameters." });
    }
    const weekStartDate = new Date(weekBeginning);
    const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

    const allEvents = await Event.find({
      status: "pending" ,
      __t: "SchoolTour", reserveDates: { $elemMatch: { visitDate: { $gte: weekStartDate, $lte: weekEndDate } } }
    });

    const schedule   = await WeeklySchedule.findOne({ weekBeginning: weekStartDate });
    const slots = schedule.slots;

    const matchingSlots = [];
    for (const event of allEvents) {
      for (const slot of slots) {
        if (slot.isEmpty) {
          const visitDay = event.visitDate.toLocaleDateString("en-US", { weekday: "long" });
          if (slot.slotDay === visitDay && slot.slotTime === event.visitTime) {
            matchingSlots.push({
              event: event,
              slot: slot,
            });
          }
        }
      }
    }
    
    return res.status(200).json(matchingSlots);
  } catch (error) {
    console.error("Error in getAllEventsAndMatchingSlots:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
     
}
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

    await assignEventToSlot(event, slot, weeklySchedule);

    return res.status(200).json({ message: "Event successfully assigned to the slot" });
  } catch (error) {
    console.error("Error assigning event to slot:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

