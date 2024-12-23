const mongoose = require("mongoose");
const WeeklySchedule = require("./WeeklySchedule");
const Applicant = require("../models/Applicant");
const Event = require("../models/Event");
const SchoolTour = require("../models/SchoolTour.js");

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
        events: [],
        availableEvents: [],
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

    const allEvents = await Event.find({
      status: { $in: ["accepted", "completed-verified"] },
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

    for (const event of filteredEvents) {
      const slot = weeklySchedule.slots.find(
        (s) => s.slotDay === event.weekday && s.slotTime === event.visitTime
      )

      if (slot) {
        slot.events.push(event._id);
      }
    }
  

  await weeklySchedule.save();
  return weeklySchedule;
}

// Assign events to available slots in the weekly schedule
async function assignEventsToSlots(startOfTheWeek) {
  try {
    let weeklySchedule = await WeeklySchedule.findOne({ weekBeginning: startOfTheWeek }).populate([
      { path: "slots.events", model: "Event" },
      { path: "slots.availableEvents", model: "Event" },
    ]);
    
    if (!weeklySchedule) {
      weeklySchedule = await createWeeklySchedule(startOfTheWeek);
    }

    const validWeekBeginning = getValidStartDate(weeklySchedule);

    const allEvents = await Event.find({
      status: "pending",
      __t: "SchoolTour"
    }).populate("applicant");
    
    const filteredEvents = allEvents.filter((event) =>
      event.reserveDates.some((date) => {
        const visitDate = new Date(date.visitDate);
        return (
          visitDate >= new Date(validWeekBeginning) &&
          visitDate <= new Date(weeklySchedule.weekEnding)
        );
      })
    );
    
    await assignAvailableEventsToSlots(weeklySchedule);
    const sortedEvents = await sortEventsByPriority(filteredEvents);

    const notPlacedEvents = [];
    for (const event of sortedEvents) {
      const isPlaced = await placeToAvailableSlot(event, weeklySchedule);
      if (!isPlaced) notPlacedEvents.push(event);
    }

    const eventsToCancel = await checkLastChances(notPlacedEvents, weeklySchedule);

    await cancelEvents(eventsToCancel);
    await weeklySchedule.save();

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
    let priorityA = priorityMap[a.applicant.priority] + a.cancellationTimes / 2;
    let priorityB = priorityMap[b.applicant.priority] + b.cancellationTimes / 2;

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
  const validWeekBeginning = getValidStartDate(weeklySchedule);

  for (const reservedDate of event.reserveDates) {
    const visitDay = new Date(reservedDate.visitDate).toLocaleDateString("en-US", { weekday: "long" });
    const visitTime = reservedDate.visitTime;
    
    if (new Date(reservedDate.visitDate) >= new Date(validWeekBeginning) &&
        new Date(reservedDate.visitDate) <= new Date(weeklySchedule.weekEnding)) {

      const slot = weeklySchedule.slots.find(
        (slot) => slot.slotDay === visitDay && 
                  slot.slotTime === visitTime && 
                  !slot.isFull);

      if (slot && !doesAlreadyExistInEvents(event, slot)) {
        await assignEventToSlot(event, slot, weeklySchedule);
        return true;
      }
    }
  }

  return false;
}

function doesAlreadyExistInAvailableEvents(event, slot) {
  try {
    // Ensure the slot is populated with availableEvents
    if (!slot.availableEvents) {
      throw new Error("Slot does not have availableEvents populated.");
    }

    // Check if the event exists in the availableEvents array
    return slot.availableEvents.some(
      (availableEvent) => availableEvent._id.toString() === event._id.toString()
    );
  } catch (error) {
    console.error("Error in doesAlreadyExistInAvailableEvents:", error);
    throw error;
  }
}

function doesAlreadyExistInEvents(event, slot) {
  try {
    // Ensure the slot is populated with events
    if (!slot.events) {
      throw new Error("Slot does not have events populated.");
    }

    // Check if the event exists in the events array
    return slot.events.some(
      (existingEvent) => existingEvent._id.toString() === event._id.toString()
    );
  } catch (error) {
    console.error("Error in doesAlreadyExistInEvents:", error);
    throw error;
  }
}



async function hasFutureReserveDate(event, weeklySchedule) {
  return event.reserveDates.some((reservedDate) =>
    new Date(reservedDate.visitDate) > new Date(weeklySchedule.weekEnding)
  );
}

async function replaceEventsRecursively(event, weeklySchedule, visitedSlots = new Set()) {
  for (const reservedDate of event.reserveDates) {
    const visitDay = new Date(reservedDate.visitDate).toLocaleDateString("en-US", { weekday: "long" });
    const visitTime = reservedDate.visitTime;

    // Find the corresponding slot
    const slot = weeklySchedule.slots.find(
      (s) => s.slotDay === visitDay && s.slotTime === visitTime
    );
  
    const validWeekBeginning = getValidStartDate(weeklySchedule);
    if (!slot || visitedSlots.has(slot) || (validWeekBeginning > new Date(reservedDate.visitDate)) ||
     (new Date(weeklySchedule.weekEnding) < new Date(reservedDate.visitDate))) continue; // Skip if slot does not exist or is already visited

    visitedSlots.add(slot); // Mark this slot as visited

    if (!slot.isFull) {
      // If slot is not full, place the event and return success
      await assignEventToSlot(event, slot, weeklySchedule);
      await weeklySchedule.populate("slots.events");
      return true;
    } else {

      for (const slotEvent of slot.events) {
        if (slotEvent.status === "scheduled") {
          const success = await replaceEventsRecursively(slotEvent, weeklySchedule, visitedSlots);

          if (success) {
            // If successfully placed, now assign the new event to the current slot
            await removeEventFromSlot(slotEvent, slot, weeklySchedule);
            await assignEventToSlot(event, slot, weeklySchedule);

            return true;
          }
        }
      }
    }
  }

  // If no suitable slot was found, return false
  return false;
}


async function checkLastChances(remainingEvents, weeklySchedule) {
  const eventsToCancel = [];
  const validWeekBeginning = getValidStartDate(weeklySchedule);
  await weeklySchedule.populate({
    path: "slots.events",
    model: "Event",
  });
  
  for (const event of remainingEvents) {
    
    let isScheduled = false;
    let hasFutureDates = false;
    for (const reservedDate of event.reserveDates) {
      if (validWeekBeginning < new Date(reservedDate.visitDate)) {
        const visitDay = new Date(reservedDate.visitDate).toLocaleDateString("en-US", { weekday: "long" });
        const visitTime = reservedDate.visitTime;

        const slot = weeklySchedule.slots.find((slot) => slot.slotDay === visitDay && slot.slotTime === visitTime);

        isScheduled = await replaceEventsRecursively(event, weeklySchedule);
        await weeklySchedule.populate("slots.events");

        
        if (!isScheduled) {
          hasFutureDates = await hasFutureReserveDate(event, weeklySchedule);
        }

        // If event still not could not find an alternative, try to postpone some events
        if (!isScheduled && !hasFutureDates) {
          for (const slotEvent of slot.events) {
            
            const slotEventHasFutureDates = await hasFutureReserveDate(slotEvent, weeklySchedule);
            if (slotEventHasFutureDates && slotEvent.status === "scheduled") {
              
              slotEvent.status = "pending";
              await slotEvent.save();
              await removeEventFromSlot(slotEvent, slot, weeklySchedule);
              await assignEventToSlot(event, slot, weeklySchedule);
  
              isScheduled = true;
              break;
            }
          }

        }
      }

      if (isScheduled) {
        await weeklySchedule.populate({
          path: "slots.events",
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
    try {
      // Turned off because of google email sending limits
      //sendCancelationEmail(event.applicant.email, event.schoolName, resubmissionLink);
    }
    catch {
      console.error("Could not sent canceling email");
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

async function assignEventToSlot(event, slot, weeklySchedule) {

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const targetDayIndex = daysOfWeek.indexOf(slot.slotDay);

  const weekBeginningDate = new Date(weeklySchedule.weekBeginning);
  const targetDate = new Date(weekBeginningDate);
  targetDate.setDate(weekBeginningDate.getDate() + targetDayIndex);

  event.visitDate = targetDate;
  event.visitTime = slot.slotTime;
  event.weekday = slot.slotDay;
  event.status = "scheduled";
  await event.save()

  

  slot.events.push(event._id);
  slot.isEmpty = false;
  if (slot.events.length > 4) {
    slot.isFull = true;
  }

  await weeklySchedule.save();
}

function getValidStartDate(weeklySchedule) {
  const today = new Date();
  const weekBeginning = new Date(weeklySchedule.weekBeginning);

  // If weekBeginning has passed, return tomorrow at 00:00
  if (weekBeginning < today) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 2); // Move 2 days
    tomorrow.setHours(0, 0, 0, 0); // Set time to 00:00
    return tomorrow;
  }

  // If weekBeginning is not past yet, return weekBeginning
  return weekBeginning;
}

async function removeEventFromSlot(event, slot, weeklySchedule) {
  const index = slot.events.findIndex(
    (anEvent) => anEvent._id.toString() === event._id.toString()
  );
  if (index !== -1) {
    slot.events.splice(index, 1);
  }

  if (slot.events.length < 1) {
    slot.isEmpty = true;
  }

  await weeklySchedule.save();
}

async function resetEvents() {
  const scheduledEvents = await SchoolTour.find( {status: {$in: ["scheduled", "canceled-resubmission-requested"]}} );
  for (const event of scheduledEvents) {
    event.status = "pending";
    await event.save();
  }
}

async function assignAvailableEventsToSlots(weeklySchedule) {
  const allEvents = await Event.find({
    status: { $in: ["pending", "scheduled", "canceled-resubmission-requested"] },
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

  for (const event of filteredEvents) {
    for (const reservedDate of event.reserveDates) {
      const visitDay = reservedDate.visitDate.toLocaleDateString("en-US", { weekday: "long" });
      const visitTime = reservedDate.visitTime;

      if (new Date(weeklySchedule.weekBeginning) <= new Date(reservedDate.visitDate) &&
             new Date(weeklySchedule.weekEnding) >= new Date(reservedDate.visitDate)) {

        const possibleSlot = weeklySchedule.slots.find((s) => s.slotDay === visitDay && s.slotTime === visitTime);
        
        if (possibleSlot && !doesAlreadyExistInAvailableEvents(event, possibleSlot)) {
          possibleSlot.availableEvents.push(event._id);
        }
      }
    }
  }
  await weeklySchedule.save();
}

exports.removeEventFromSchedule = async (eventId) => {
  try {
    // Find the weekly schedule containing the event
    const schedule = await WeeklySchedule.findOne({
      "slots.events": eventId,
    });

    // Find and update the slot containing the event
    const slot = schedule.slots.find(
      (s) => s.events && s.events.some((e) => e.toString() === eventId)
    );

    const event = await Event.findById(eventId);

    if (slot) {
      await removeEventFromSlot(event, slot, schedule);
    }

    if (event.status !== "rejected" && event.status !== "canceled-by-applicant" && event.status !== "completed-non-verified" && event.status !== "canceled-resubmission-requested") {
      event.status = "pending";
    }
    await event.save();
  } catch (error) {
    console.error("Error removing event from schedule:", error);
  }
}

exports.getWeeklySchedules = async (req, res) => {
  try {/*
    for (let i = 0; i < 100; i++) {
      await createRandomSchoolTour();
    }*/
    await WeeklySchedule.deleteMany({});
    await resetEvents();

    const currentMonday = await getCurrentMonday();
    const weeklyDates = [];
    for (let i = 1; i <= 6; i++) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(weekStart.getDate() + i * 7);
      weeklyDates.push(weekStart);
    }

    const schedules = [];
    for (const date of weeklyDates) {
      const newSchedule = await assignEventsToSlots(date);
      await newSchedule.populate([
        {
          path: "slots.events",
          model: "Event",
          populate: { path: "applicant", model: "Applicant" }, // Populate applicant inside events
        },
        {
          path: "slots.availableEvents",
          model: "Event",
          populate: { path: "applicant", model: "Applicant" }, // Populate applicant inside availableEvents
        },
      ]);

      schedules.push(newSchedule);
    }

    return res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching weekly schedules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.loadWeeklySchedules = async (req, res) => {
  try {
    /*
    for (let i = 0; i < 100; i++) {
      await createRandomSchoolTour();
    }*/
    const currentMonday = await getCurrentMonday();

    const weeklyDates = [];
    for (let i = 1; i <= 6; i++) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(weekStart.getDate() + i * 7);
      weeklyDates.push(weekStart);
    }


    const schedules = [];
    for (const date of weeklyDates) {
      let weeklySchedule = await WeeklySchedule.findOne({ weekBeginning: date });
      if (weeklySchedule) {await assignAvailableEventsToSlots(weeklySchedule);}
      else {
        weeklySchedule = await assignEventsToSlots(date);
      }

      await weeklySchedule.populate([
        {
          path: "slots.events",
          model: "Event",
          populate: { path: "applicant", model: "Applicant" }, // Populate applicant inside events
        },
        {
          path: "slots.availableEvents",
          model: "Event",
          populate: { path: "applicant", model: "Applicant" }, // Populate applicant inside availableEvents
        },
      ]);
      
      // Use array for populating multiple paths
      schedules.push(weeklySchedule);
    }

    return res.status(200).json(schedules);
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

exports.assignEventToSlot = async (req, res) => {
  const { eventId, weekBeginning, slotDay, slotTime } = req.body;

  try {
    // Find the event with the matching schoolName
    const event = await Event.findById(eventId);

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

    await assignEventToSlot(event, slot, weeklySchedule);

    return res.status(200).json({ message: "Event successfully assigned to the slot" });
  } catch (error) {
    console.error("Error assigning event to slot:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.clearSchedules = async (req, res) => {
  try {
    await WeeklySchedule.deleteMany({});

    const currentMonday = await getCurrentMonday();
    const weeklyDates = [];
    for (let i = 1; i <= 6; i++) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(weekStart.getDate() + i * 7);
      weeklyDates.push(weekStart);
    }

    for (const date of weeklyDates) {
      const newSchedule = await createWeeklySchedule(date);
      await newSchedule.save();
    }
    
    await resetEvents();

    res.status(200).json({ message: "Scheduled events cleared successfully" });
  } catch (error) {
    console.error("Error clearing scheduled events:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const fs = require('fs');
const path = require('path');

async function createRandomSchoolTour() {
  try {
    // Load the high school data
    const highSchoolsDataPath = path.resolve(__dirname, '../data/high_schools_list.json');
    const highSchools = JSON.parse(fs.readFileSync(highSchoolsDataPath, 'utf-8'));

    // Pick a random high school
    const randomSchool = highSchools[Math.floor(Math.random() * highSchools.length)];

    // Generate random priority
    const random = Math.random();
    let randomPriority = "General";
    if (random < 0.65) {
      randomPriority = "General"; // 65% chance
    } else if (random < 0.90) {
      randomPriority = "Medium"; // 25% chance
    } else {
      randomPriority = "High"; // 10% chance
    }

    // Create a random applicant associated with the school
    const randomApplicant = new Applicant({
      name: randomSchool.SchoolName,
      phoneNumber: `+905${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`,
      typeOfApplicant: "School",
      email: `applicant_${Math.random().toString(36).substr(2, 5)}@example.com`,
      priority: randomPriority,
      schoolID: randomSchool.id,
    });

    await randomApplicant.save();

    // Generate reserve dates
    const visitTimes = ["09:00", "11:00", "13:30", "16:00"];
    const reserveDates = [];
    const currentDate = new Date();
    for (let i = 0; i < 3; i++) {
      const reserveDate = new Date(currentDate);
      reserveDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 30) + 2); // Within the next 30 days
      reserveDate.setHours(0, 0, 0, 0); // Set to start of the day
      reserveDates.push({
        visitDate: reserveDate,
        visitTime: visitTimes[Math.floor(Math.random() * visitTimes.length)],
      });
    }

    // Create the School Tour event
    const randomSchoolTour = new SchoolTour({
      applicant: randomApplicant._id,
      schoolName: randomSchool.SchoolName,
      contactPerson: `Contact_${Math.random().toString(36).substr(2, 5)}`,
      email: `contact_${Math.random().toString(36).substr(2, 5)}@example.com`,
      city: randomSchool.City,
      district: randomSchool.District,
      phoneNumber: `+905${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`,
      studentCount: Math.floor(Math.random() * 50) + 10, // Random student count between 10 and 60
      additionalNotes: "This is a randomly generated School Tour event for testing.",
      reserveDates: reserveDates,
      reservedRooms: ["B205", "FFB-22", "FFB-05", "FFB-06", "EE-01", "MitatCoruh"][
        Math.floor(Math.random() * 6)
      ], // Random reserved room
      visitDate: reserveDates[0].visitDate, // Assign the first reserve date
      visitTime: reserveDates[0].visitTime,
      requiredNumberOfGuides: Math.ceil((Math.floor(Math.random() * 50) + 10) / 60),
      status: "pending",
      typeStr: "School Tour",
    });

    await randomSchoolTour.save();

    // Add the School Tour to the applicant's events
    await randomApplicant.saveEvent(randomSchoolTour._id);

    return randomSchoolTour;
  } catch (error) {
    console.error("Error creating random school tour:", error);
    throw error;
  }
}

