const mongoose = require("mongoose");
const WeeklySchedule = require("./WeeklySchedule");
const EventSlot = require("./EventSlot");
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
      const slot = new EventSlot({
        slotDay: day,
        slotTime: time,
        applicant: null,
      });

      await slot.save();
      slots.push(slot);
    }
  }

  startOfTheWeek.setHours(0, 0, 0, 0);
  const endOfTheWeek = new Date(startOfTheWeek);
  endOfTheWeek.setDate(endOfTheWeek.getDate() + 4);

  // Create the weekly schedule object
  const weeklySchedule = new WeeklySchedule({
    weekBeginning: startOfTheWeek,
    weekEnding: endOfTheWeek,
    slots: slots, // Store the created slots in the schedule
  });

  await weeklySchedule.save();
  return weeklySchedule;
}

// Assign events to available slots in the weekly schedule
async function assignEventsToSlots() {
  try {
    const now = new Date();
    const startOfTheWeek = new Date(now.setDate(now.getDate() + (7 - now.getDay()) + 8)); // Monday of two weeks later
    startOfTheWeek.setHours(0, 0, 0, 0); // Reset the time to midnight

    let weeklySchedule;
    try {
      // Fetch or create weekly schedule for 2 weeks later
      weeklySchedule = await WeeklySchedule.findOne({ weekBeginning: startOfTheWeek }).populate('slots');
      if (!weeklySchedule) {
        weeklySchedule = await createWeeklySchedule(startOfTheWeek); // Create a new weekly schedule if it doesn't exist
      }
    } catch (error) {
      console.error("Error fetching or creating weekly schedule:", error);
      return; // Stop the function if an error occurs when fetching or creating the schedule
    }

    let events;
    try {
      // Fetch all pending School Tour events for the next week
      events = await Event.find({
        status: "pending",
        typeStr: "School Tour",
        reserveDates: {
          $elemMatch: {
            visitDate: { $gte: weeklySchedule.weekBeginning, $lte: weeklySchedule.weekEnding }
          }
        }
      }).populate('applicant');
    } catch (error) {
      console.error("Error fetching events:", error);
      return;
    }

    let sortedEvents;
    try {
      sortedEvents = await sortEventsByPriority(events);
    } catch (error) {
      console.error("Error sorting events by priority:", error);
      return;
    }

    let notPlacedEvents = [];
    for (const event of sortedEvents) {
      try {
        const isPlaced = await placeToAvailableSlot(event, weeklySchedule);

        if (!isPlaced) {
          notPlacedEvents.push(event);
        }
      } catch (error) {
        console.error(`Error placing event ${event._id} into a slot:`, error);
      }
    }

    const remainingEvents = await Promise.all(
      notPlacedEvents.map(async (anEvent) => {
        const hasFutureDate = await hasFutureReserveDate(anEvent, weeklySchedule);
        return hasFutureDate ? null : anEvent;
      })
    );
      
      const filteredRemainingEvents = remainingEvents.filter(event => event !== null);
      

    let notReplacedEvents;
    try {
      notReplacedEvents = await checkLastChances(remainingEvents, weeklySchedule);
    } catch (error) {
      console.error("Error checking last chances for remaining events:", error);
      return;
    }

    try {
      await cancelEvents(notReplacedEvents);
    } catch (error) {
      console.error("Error canceling events:", error);
    }

    try {
      await updateEventStatus(weeklySchedule);
    } catch (error) {
      console.error("Error updating event status:", error);
    }

  } catch (error) {
    console.error("Error assigning events to slots:", error);
  }
}


async function sortEventsByPriority(events) {
  const priorityMap = {
    High: 1,
    Medium: 2,
    General: 3,
  };
  
  return populatedEvents.sort((a, b) => {
    const priorityA = priorityMap[a.applicant.priority] + (a.cancellationTimes / 2);
    const priorityB = priorityMap[b.applicant.priority] + (b.cancellationTimes / 2);

    const priorityDiff = priorityB - priorityA;
    if (priorityDiff !== 0) return priorityDiff;

    return a.reserveDates.length - b.reserveDates.length;
  });
}



async function placeToAvailableSlot(event, weeklySchedule) {
  // Loop through each reserved date to find a matching available slot
  for (const reservedDate of event.reserveDates) {

    // Find an available slot that matches the reserved date's day and time
    const slot = await findSlot(reservedDate, weeklySchedule);

    // Ensure a slot is found and is available
    if (slot && slot.isEmpty) {
      // Assign the event to the found slot
      slot.event = event._id;
      slot.isEmpty = false; // Mark the slot as no longer empty

      try {
        // Save the slot with the updated event
        await slot.save();
        return true; // Return true once the slot is assigned successfully
      } catch (error) {
        console.error("Error saving slot:", error);
        return false; // If there's an error saving the slot, return false
      }
    }
  }
  
  // Return false if no matching available slot is found
  return false;
}

async function findSlot(reservedDate, weeklySchedule) {
  // Extract the day and time from the reservedDate
  const visitDay = reservedDate.visitDate.toLocaleDateString("en-US", { weekday: "long" });
  const visitTime = reservedDate.visitTime;

  // Find the slot in weeklySchedule that matches the reservedDate's day and time, and is available
  const slot = weeklySchedule.slots.find(slot => {
    return slot.slotDay === visitDay && slot.slotTime === visitTime;
  });

  // If a matching slot is found, return it. Otherwise, return null.
  return slot || null;
}

async function hasFutureReserveDate(event, weeklySchedule) {
  const weekEnding = weeklySchedule.weekEnding;

  // Loop through each reserveDate in the event
  for (const reservedDate of event.reserveDates) {
    // If a reserveDate is after weekEnding, return true
    if (new Date(reservedDate.visitDate) > new Date(weekEnding)) {
      return true;
    }
  }

  // If no reserveDate is after weekEnding, return false
  return false;
}

async function checkLastChances(remainingEvents, weeklySchedule) {
  let notReplacedEvents = remainingEvents.slice();

  for (const event of remainingEvents) {
    
    for (const reservedDate of event.reserveDates) {

      const slot = await findSlot(reservedDate, weeklySchedule);
      slot.populate('event');

      if (hasFutureReserveDate(slot.event)) {
        slot.event = event._id;
        notReplacedEvents = notReplacedEvents.filter(anEvent => anEvent !== event);
        break;
      }
    }
  }

  return notReplacedEvents;
}

async function cancelEvents(events) {
    for (const event of events) {
        const req = { params: { eventId: event._id } };
        const res = { 
            status: (statusCode) => ({ 
                json: (message) => console.log(`Response: ${statusCode}, ${JSON.stringify(message)}`)
            })
        };
        await markEventAsCanceled(req, res); // Awaiting the cancellation process
    }
}


async function updateEventStatus(weeklySchedule) {
  for (const slot of weeklySchedule.slots) {
    const populatedSlot = await slot.populate("event");
    if (populatedSlot.event) {
      populatedSlot.event.status = "scheduled";
      await populatedSlot.event.save(); // Don't forget to save the event
    }
  }
}
