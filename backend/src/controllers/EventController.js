const Event = require("../models/Event");
const User = require("../models/User");
const Advisor = require("../models/Advisor");
const SchoolTour = require("../models/SchoolTour");
const IndividualTour = require("../models/IndividualTour");
const Applicant = require("../models/Applicant");
const {sendNotification} = require("../controllers/NotificationController");
const fs = require("fs");
const path = require("path");
const {
  sendConfirmationEmail,
  sendReviewEmail,
  sendGuideAssignmentEmail,
  sendNotificationEmail,
} = require("../config/EmailService");
const { removeEventFromSchedule } = require("../applicationManagement/AppointmentManager");
const { createLog } = require("./LogController");
const jwt = require("jsonwebtoken");

// Get events with status "accepted"
exports.getAcceptedEvents = async (req, res) => {
  try {
    // return all accepted events until next two weeks
    const today = new Date();
    const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const acceptedEvents = await Event.find({ status: "accepted" , visitDate: { $gte: today, $lte: twoWeeksLater }})
      .populate("assignedAdvisor")
      .populate("assignedUsers")
      .populate("applicant")
      .populate("appliedUsers");

    res.status(200).json(acceptedEvents);
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getAssigneddEventsOfUser = async (req, res) => {
  try {
    let userparams = req.user;
    const { completed } = req.query;

    if (completed) {
      if (userparams.role !== "coordinator") {
        const user2 = await User.findById(userparams.id);
        const completedEvents = await Event.find({
          _id: { $in: user2.completedEvents },
        })
          .populate("assignedAdvisor")
          .populate("assignedUsers")
          .populate("applicant")
          .populate("appliedUsers");

        return res.status(200).json(completedEvents);
      } else {
        return res.status(400).json({ message: "Access Forbidden" });
      }
    }
    if (userparams.role !== "coordinator") {
      const user2 = await User.findById(userparams.id);
      const acceptedEvents = await Event.find({
        _id: { $in: user2.assignedEvents },
      })
        .populate("assignedAdvisor")
        .populate("assignedUsers")
        .populate("applicant")
        .populate("appliedUsers");

      res.status(200).json(acceptedEvents);
    } else {
      res.status(400).json({ message: "Access Forbidden" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getApplicationsOfAdvisor = async (req, res) => {
  try {
    let userparams = req.user;

    if (userparams.role === "advisor") {
      const user2 = await User.findById(userparams.id);
      const acceptedEvents = await Event.find({ weekday: user2.assignedDay })
        .populate("assignedAdvisor")
        .populate("assignedUsers")
        .populate("applicant")
        .populate("appliedUsers");

      res.status(200).json(acceptedEvents);
    } else {
      res.status(401).json({ error: "Access Denied" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Create a school tour
exports.createSchoolTour = async (req, res) => {
  try {
    const {
      applicant,
      schoolName,
      contactPerson,
      email,
      visitDate,
      visitTime,
      city,
      district,
      studentCount,
      additionalNotes,
      phoneNumber,
      reserveDates,
    } = req.body;

    if (
      !applicant ||
      !schoolName ||
      !contactPerson ||
      !email ||
      !visitDate ||
      !visitTime ||
      !city ||
      !studentCount ||
      !phoneNumber
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const schoolTour = new SchoolTour({
      applicant,
      schoolName,
      contactPerson,
      email,
      visitDate: new Date(visitDate),
      visitTime,
      city,
      district,
      studentCount,
      additionalNotes,
      phoneNumber,
      reserveDates: reserveDates
        ? reserveDates.map((date) => {
            return { visitDate: new Date(date.date).setHours(0,0,0,0,), visitTime: date.time };
          })
        : [],
    });
    schoolTour.setRequiredNumberOfGuides();
    schoolTour.addToApplicantEvents();
    schoolTour.setWeekday();

    const savedTour = await schoolTour.save();
    await savedTour.generateReferenceCode(); // Generate reference code
    await savedTour.populate("applicant");
    await sendConfirmationEmail(email, contactPerson, "processing", savedTour);
    res.status(201).json({
      message: "School tour created successfully",
      schoolTour,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating school tour",
      error: error.message,
    });
  }
};

// Create an individual tour
exports.createIndividualTour = async (req, res) => {
  try {
    const {
      applicant,
      visitDate,
      visitTime,
      studentHighSchool,
      studentName,
      majorOfInterest,
      additionalNotes = "",
      hoursOfWork = 3,
      requiredNumberOfGuides = 1,
      city,
      district,
      status = "pending",
    } = req.body;

    const individualTour = new IndividualTour({
      applicant,
      visitDate,
      visitTime,
      studentHighSchool,
      majorOfInterest,
      studentName,
      additionalNotes,
      hoursOfWork,
      requiredNumberOfGuides,
      status,
      city,
      district,
      typeStr: "Individual Tour",
    });
    individualTour.addToApplicantEvents();
    individualTour.setWeekday();

    const savedTour = await individualTour.save();
    await savedTour.generateReferenceCode(); // Generate reference code
    await savedTour.populate("applicant");
    await sendConfirmationEmail(
      savedTour.applicant.email,
      savedTour.applicant.name,
      "processing",
      savedTour
    );
    res.status(201).json({
      message: "Individual tour created successfully",
      tour: savedTour,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create individual tour",
      error: error.message,
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { id, role } = req.user; // Extract user information
    const { accepted, advisor } = req.query; // Extract query parameters

    // If the user is an advisor requesting their assigned events
    if (advisor === "true" && role === "advisor") {
      const foundAdvisor = await Advisor.findById(id);

      // Handle missing advisor
      if (!foundAdvisor) {
        return res.status(404).json({ message: "Advisor not found" });
      }

      // Build the query for advisor's assigned events
      const query = { weekday: foundAdvisor.assignedDay };
      if (accepted === "true") {
        query.status = "accepted";
      }

      const events = await Event.find(query)
        .populate("assignedAdvisor")
        .populate("assignedUsers")
        .populate("applicant")
        .populate("appliedUsers");

      return res.status(200).json(events);
    }

    // If accepted events are requested
    if (accepted === "true") {
      const events = await Event.find({ status: "accepted" })
        .populate("assignedAdvisor")
        .populate("assignedUsers")
        .populate("applicant")
        .populate("appliedUsers");

      return res.status(200).json(events);
    }

    // Default case: Fetch all events
    const events = await Event.find()
      .populate("assignedAdvisor")
      .populate("assignedUsers")
      .populate("applicant")
      .populate("appliedUsers");

    return res.status(200).json(events);
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//gets completed events
exports.getCompletedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: {
        $in: [
          "completed-non-verified",
          "completed-verified",
        ],
      },
    })
      .populate("assignedAdvisor")
      .populate("assignedUsers")
      .populate("applicant")
      .populate("appliedUsers");

    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch events", error: error.message });
  }
};

// Get a specific event
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the event by ID
    let event = await Event.findById(id)
      .populate("assignedAdvisor")
      .populate("assignedUsers")
      .populate("applicant")
      .populate("appliedUsers");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error in getEvent:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Find event by reference code
exports.getEventByReferenceCode = async (req, res) => {
  try {
    const { referenceCode } = req.params;
    const { city, district, schoolName } = req.query;

    const query = { referenceCode };

    if (city) query.city = city;
    if (district) query.district = district;
    if (schoolName) {
      query.schoolName = schoolName
    };
    
    let event = await Event.findOne(query)
      .populate("applicant");
    if(!event) {
      query.schoolName ="";
      query.studentHighSchool = schoolName;
      event = await IndividualTour.findOne(query)
      .populate("applicant");
    }
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error in getEventByReferenceCode:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const acceptTourApplicationByCoordinator = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userrole, userid } = req.headers;
    const weeakday = req.body.event.weekday;
    const advisors = await Advisor.find({ assignedDay: weeakday });
    const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];
    if (!randomAdvisor) {
      return res
        .status(404)
        .json({ message: "No Advisor with the weekday found" });
    }

    await randomAdvisor.acceptTourApplication(eventId);
    await randomAdvisor.save();
    createLog(userid, userrole, 'acceptTourApplication', eventId, 'success', `Tour application accepted and assigned to advisor ${randomAdvisor.name} with mail ${randomAdvisor.email}`);
    return res.status(200).json({
      message:
        "Tour application accepted and a random advisor has been assigned!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
const acceptTourApplication = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userrole, userid } = req.headers;
    if (userrole === "coordinator" || userrole === "admin") {
      return await acceptTourApplicationByCoordinator(req, res);
    } else if (userrole !== "advisor") {
      return res.status(401).json({
        message: "Only advisors can accept tour applications",
      });
    }

    const advisor = await Advisor.findById(userid);
    await advisor.acceptTourApplication(eventId);
    await advisor.save();
    createLog(userid, userrole, 'acceptTourApplication', eventId, 'success', `Tour application accepted`);
    return res.status(200).json({ message: "Tour application accepted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.updateEventTwo = async (req, res) => {
  const { eventId } = req.params;
  const updateData = req.body;

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Identify changed fields
    const changedFields = {};
    for (let key in updateData) {
      if (updateData[key] !== event[key]) {
        changedFields[key] = updateData[key];
        event[key] = updateData[key]; // Update the event object
      }
    }

    // If no changes, return
    if (Object.keys(changedFields).length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    // Save the updated event
    const updatedEvent = await event.save();

    // Populate applicant and send email
    await updatedEvent.populate("applicant");
    const applicant = updatedEvent.applicant;

    if (applicant) {
      await sendNotificationEmail(applicant.email, applicant.name, changedFields, updatedEvent);
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: `Error updating event: ${error.message}` });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, event } = req.body;
    let updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
    });
    updatedEvent = await updatedEvent.populate("applicant");
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (status === "accepted" || status === "rejected") {
      const applicant = updatedEvent.applicant;
      if (applicant) {
        await sendConfirmationEmail(
          applicant.email,
          applicant.name,
          status,
          updatedEvent
        );
      }
      if (status === "accepted") {

        return await acceptTourApplication(req, res);
      } else {
        await removeEventFromSchedule(eventId);
        if (updatedEvent.applicant.priority  === "high") {
          createLog(req.user.id, req.user.role, 'updateEvent', eventId, 'success', 'Event rejected and removed from schedule of high priority applicant ' + updatedEvent.applicant.name); 
          return res.status(200).json({ message: "Event rejected and removed from schedule" , event: updatedEvent});
        }
      }
    }

    createLog(req.user.id, req.user.role, 'updateEvent', eventId, 'success', 'Event updated successfully');
    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);
    createLog(req.user.id, req.user.role, 'updateEvent', req.params.eventId, 'error', error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteEventFromUsers = async (eventId) => {
  const users = await User.find();
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.assignedEvents.includes(eventId)) {
      const eventIndex = user.assignedEvents.indexOf(eventId);
      user.assignedEvents.splice(eventIndex, 1);
      await user.save();
    }
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = await User.findById(req.user.id);

    const event = await Event.findByIdAndDelete(eventId);
    try {
      const applicant = await Applicant.findById(
        event.applicant.applicantID
      );
      applicant.events = applicant.events.filter(
        (event) => event._id != eventId
      );
      await applicant.save();
      await deleteEventFromUsers(eventId);
    } catch (error) {
      console.error(error);
    }
    if (!event) {
      createLog(req.user.id, req.user.role, 'deleteEvent', eventId, 'error', 'Event not found');
      return res.status(404).json({ message: "Event not found" });
    }
    await event.removeFromAssigneesEvents();
    user && createLog(req.user.id, req.user.role, 'deleteEvent', eventId, 'success', 'Event deleted successfully');
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    createLog(req.user.id, req.user.role, 'deleteEvent', req.params.eventId, 'error', error.message);
    res
      .status(500)
      .json({ message: "Failed to delete event", error: error.message });
  }
};

// Assign advisor to a tour
exports.assignAdvisorToTour = async (req, res) => {
  try {
    const { advisorID, eventID } = req.body;

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const advisor = await User.findById(advisorID);
    if (!advisor || advisor.role !== "advisor") {
      return res.status(400).json({ message: "Invalid advisor ID" });
    }

    event.assignedAdvisor = advisorID;
    await event.save();

    res.status(200).json({ message: "Advisor assigned successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to assign advisor", error: error.message });
  }
};

// Assign guide to an event
exports.assignGuideToEvent = async (req, res) => {
  try {
    const { userID, eventID } = req.body;

    // Find the event
    const event = await Event.findById(eventID);
    if (!event) {
      createLog(req.user.id, req.user.role, 'assignGuideToEvent', eventID, 'error', 'Event not found');
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the guide ID is valid
    const guide = await User.findById(userID);
    if (!guide) {
      createLog(req.user.id, req.user.role, 'assignGuideToEvent', userID, 'error', 'Invalid guide ID');
      return res.status(400).json({ message: "Invalid guide ID" });
    }

    // Check if the number of assigned guides exceeds the limit
    if (event.assignedUsers.length >= event.requiredNumberOfGuides) {
      createLog(req.user.id, req.user.role, 'assignGuideToEvent', eventID, 'error', 'Guide limit exceeded');
      return res.status(400).json({
        message: `Cannot assign more than ${event.requiredNumberOfGuides} guide(s) to this event.`,
      });
    }
    // Check if the guide is already assigned
    if (event.assignedUsers.includes(userID)) {
      createLog(req.user.id, req.user.role, 'assignGuideToEvent', eventID, 'error', 'Guide already assigned');
      return res
        .status(400)
        .json({ message: "Guide is already assigned to this event." });
    }

    // Assign the guide to the event
    event.assignedUsers.push(userID);
    await event.save();

    // Add the event to the guide's list of assigned events
    try {
      await guide.addAssignedEvent(eventID);
      await guide.save();

      // Send guide assignment email
      await sendGuideAssignmentEmail(guide, event);
    } catch (error) {
      console.error(error);
      createLog(req.user.id, req.user.role, 'assignGuideToEvent', eventID, 'error', error.message);
      return res
        .status(400)
        .json({ message: "Failed to assign guide", error: error.message });
    }
    if (req.user.id === userID) {
      createLog(req.user.id, req.user.role, 'assignGuideToEvent', eventID, 'success', `Guide ${guide.name} assigned successfully to event `);}
    else {
      const user = await User.findById(req.user.id);
      createLog(req.user.id, req.user.role, 'assignGuideToEventByOther', eventID, 'success', `Guide ${guide.name} assigned successfully to event`);
    }
    createLog(req.user.id, req.user.role, 'assignGuideToEvent', eventID, 'success', 'Guide assigned successfully');
    return res.status(200).json({ message: "Guide assigned successfully" , assignedGuide : guide});
  } catch (error) {
    console.error(error);
    createLog(req.user.id, req.user.role, 'assignGuideToEvent', req.body.eventID, 'error', error.message);
    res
      .status(500)
      .json({ message: "Failed to assign guide", error: error.message });
  }
};

exports.removeAssignedGuideFromEvent = async (req, res) => {
  try {
    const { userID, eventID } = req.body;

    const event = await Event.findById(eventID);
    const user = await User.findById(userID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    try {
      await event.removeAssignee(userID);
      await user.removeAssignedEvent(eventID);
      await event.save();
      await user.save();
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: error.message });
    }
    createLog(req.user.id, req.user.role, 'removeAssignedGuideFromEvent', eventID, 'success', 'Guide removed successfully from event');
    res.status(200).json({ message: "Guide removed successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to remove guide", error: error.message });
  }
};

exports.getEventAssignees = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const assignees = await User.find({ _id: { $in: event.assignedUsers } });

    res.status(200).json(assignees);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getSchoolTourCountsByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const schoolTours = await SchoolTour.find({
      visitDate: { $gte: startDate, $lte: endDate },
    });

    const tourCounts = {};

    schoolTours.forEach((tour) => {
      const dateKey =
        tour.visitDate.toISOString().split("T")[0] + `-${tour.visitTime}`;
      if (!tourCounts[dateKey]) {
        tourCounts[dateKey] = 0;
      }
      tourCounts[dateKey]++;
    });

    res.status(200).json(tourCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* NOT NEEDED
exports.markEventAsCancelled = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (!event.isUserAssigned(userId)) {
      return res
        .status(403)
        .json({ message: "User not assigned to this event" });
    }

    event.cancellationTimes++;

    
    const reviewLink = `http://localhost:5173/review/${eventId}`;

    // Populate the applicant data from the event
    await event.populate('applicant'); // Wait for population to complete
    const applicant = event.applicant;

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Send the review email
    await sendReviewEmail(applicant.email, applicant.name, reviewLink);
    

    await Event.findByIdAndUpdate(eventId, {
      status: "canceled-resubmission-requested",
    });
    res.status(200).json({ message: "Event marked as cancelled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to cancel event", error: error.message });
  }
};

*/

exports.markEventAsCompleted = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const workHours = req.body.workHours;

    // Fetch event by ID
    let event = await Event.findById(eventId).populate("assignedUsers");
    if (!event) {
      createLog(req.user.id, req.user.role, 'markEventAsCompleted', eventId, 'error', 'Event not found');
      return res.status(404).json({ message: "Event not found" });
    }
    let user = await User.findById(userId);
    if (!user) {
      createLog(req.user.id, req.user.role, 'markEventAsCompleted', userId, 'error', 'User not found');
      return res.status(404).json({ message: "User not found" });
    }
    // Check if the user is assigned to the event
    if (!event.assignedUsers.some((user) => user._id == userId)) {
      createLog(req.user.id, req.user.role, 'markEventAsCompleted', eventId, 'error', 'User not assigned to event');
      return res
        .status(403)
        .json({ message: "User not assigned to this event" });
    }
    try {
        const assignedUsers = event.assignedUsers;
        for (let i = 0; i < assignedUsers.length; i++) {
          let user = assignedUsers[i];
          // user = new User(user);
          await user.completeEvent(eventId, workHours);
        }

    } catch (error) {
      console.error(error);
      createLog(req.user.id, req.user.role, 'markEventAsCompleted', eventId, 'error', error.message);
      return res.status(400).json({ message: error.message });
    }

    event.hoursOfWork = workHours;
    // Update event status to "completed-non-verified"
    event.status = "completed-verified";
    await event.save(); // Save the updated event

    // Generate review link
    const reviewLink = `http://localhost:5173/review/${eventId}`;

    // Populate the applicant data from the event
    await event.populate("applicant"); // Wait for population to complete
    const applicant = event.applicant;

    if (!applicant) {
      createLog(req.user.id, req.user.role, 'markEventAsCompleted', eventId, 'error', 'Applicant not found');
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Send the review email
    await sendReviewEmail(applicant.email, applicant.name, reviewLink);

    // Respond with success
    createLog(req.user.id, req.user.role, 'markEventAsCompleted', eventId, 'success', 'Event marked as completed');
    res.status(200).json({
      message: "Event marked as completed successfully, review email sent.",
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    createLog(req.user.id, req.user.role, 'markEventAsCompleted', req.params.eventId, 'error', error.message);
    res
      .status(500)
      .json({ message: "Failed to complete event", error: error.message });
  }
};

exports.takeBackEventAction = async (req, res) => {
  try {
   
    const { eventId } = req.params;
    const userId = req.user.id;
    const event = await Event.findById(eventId).populate("assignedUsers");
    if (!event.assignedUsers.some((user) => user._id == userId)) {
      createLog(req.user.id, req.user.role, 'takeBackEventAction', eventId, 'error', 'User not assigned to event');
      return res
        .status(403)
        .json({ message: "User not assigned to this event" });
    }
    if (!event) {
      createLog(req.user.id, req.user.role, 'takeBackEventAction', eventId, 'error', 'Event not found');
      return res.status(404).json({ message: "Event not found" });
    }
    try {
      await event.takeBackAction();
    } catch (error) {
      createLog(req.user.id, req.user.role, 'takeBackEventAction', eventId, 'error', 'Event status not eligible for action');
      return res.status(400).json({ message: "Event status not eligible for action" });
    }


   for (let i = 0; i < event.assignedUsers.length; i++) {
      let user = event.assignedUsers[i];
      await user.takeBackCompletedEvent(eventId, event.hoursOfWork);
      await user.save();
    }
   
    createLog(req.user.id, req.user.role, 'takeBackEventAction', eventId, 'success', 'Event status set back to accepted');
    res.status(200).json({ message: "Event status set back to accepted" });
  } catch (error) {
    console.error(error);
    createLog(req.user.id, req.user.role, 'takeBackEventAction', req.params.eventId, 'error', error.message);
    res
      .status(500)
      .json({ message: "Failed to take back event", error: error.message });
  }
};





exports.isReviewSubmitted = async (req, res) => {
  const { eventId } = req.params; // Get eventId from the request parameters

  try {
    // Find the event by its ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res
      .status(200)
      .json({ isReviewAlreadySubmitted: event.reviewSubmitted });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking review status.", error: error.message });
  }
};

exports.resubmitEventReserveDates = async (req, res) => {
  const { eventId } = req.params; // Extract eventId from the URL
  const { reserveDates, visitDate, visitTime } = req.body; // Extract necessary fields from the request body

  try {
    // Validate input based on the type of tour
    if ((!Array.isArray(reserveDates) || reserveDates.length === 0) && (!visitDate || !visitTime)) {
      return res.status(400).json({ message: "Invalid input. Provide reserveDates for school tours or visitDate and visitTime for individual tours." });
    }

    // Find the event by eventId
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Check the type of the event
    if (event.typeStr === "School Tour") {
      // For school tours, update the reserveDates
      if (!Array.isArray(reserveDates) || reserveDates.length === 0) {
        return res.status(400).json({ message: "Please provide valid reserveDates for school tours." });
      }
      event.reserveDates = reserveDates;
    } else if (event.typeStr === "Individual Tour") {
      // For individual tours, update the visitDate and visitTime
      if (!visitDate || !visitTime) {
        return res.status(400).json({ message: "Please provide a valid visitDate and visitTime for individual tours." });
      }
      event.visitDate = visitDate;
      event.visitTime = visitTime;
    } else {
      return res.status(400).json({ message: "Invalid tour type. Cannot process the request." });
    }

    // Update event status
    event.status = "pending";

    // Save the updated event
    await event.save();
    res.status(200).json({
      message: "Event resubmitted successfully.",
      event,
    });
  } catch (error) {
    console.error("Error resubmitting event:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
exports.updateUserAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.setAvailability(availability);
 

    res.status(200).json({ message: "Availability updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.checkSchoolApplicationExists = async (req, res) => {
  const {schoolID} = req.params;

  const highSchoolsList = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/high_schools_list.json"), "utf-8")
  );
  
  try {
    // Convert schoolID to a number
    const schoolIdNumber = parseInt(schoolID, 10);

    if (isNaN(schoolIdNumber)) {
      return res.status(400).json({ message: "Invalid school ID." });
    }

    // Find the SchoolName corresponding to the schoolID
    const school = highSchoolsList.find((s) => s.id === schoolIdNumber);

    if (!school) {
      return res.status(404).json({ message: "School not found in the list." });
    }

    const schoolName = school.SchoolName;
    const schoolCity = school.City;

    // Search for an event in the database using the SchoolName
    const existingEvent = await SchoolTour.findOne({
      schoolName: schoolName,
      city: schoolCity,
      status: { $in: ["pending", "scheduled", "accepted", "canceled-resubmission-requested"] },
    });
    
    if (existingEvent) {
      return res.status(200).json({
        exists: true,
        message: `An application already exists for ${schoolName}.`,
      });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking for existing school application:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.resendApplicationEmail = async (req, res) => {
  const {schoolID} = req.params;

  const highSchoolsList = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/high_schools_list.json"), "utf-8")
  );
  
  try {
    // Convert schoolID to a number
    const schoolIdNumber = parseInt(schoolID, 10);

    if (isNaN(schoolIdNumber)) {
      return res.status(400).json({ message: "Invalid school ID." });
    }

    // Find the SchoolName corresponding to the schoolID
    const school = highSchoolsList.find((s) => s.id === schoolIdNumber);

    if (!school) {
      return res.status(404).json({ message: "School not found in the list." });
    }

    const schoolName = school.SchoolName;
    const schoolCity = school.City;

    // Search for an event in the database using the SchoolName
    const existingEvent = await SchoolTour.findOne({
      schoolName: schoolName,
      city: schoolCity,
      status: { $in: ["pending", "scheduled", "accepted", "canceled-resubmission-requested"] },
    }).populate('applicant');

    await sendConfirmationEmail(
      existingEvent.applicant.email,
      existingEvent.applicant.name,
      "processing",
      existingEvent
    );
    
    return res.status(200).json({ message: `Application email resent to: ${ existingEvent.applicant.email }` });
  } catch (error) {
    console.error("Error resending application email:", error);
    return res.status(500).json({
      message: "An error occurred while resending the application email.",
      error: error.message,
    });
  }
}

exports.applyToEvent = async (req, res) => {
  try {
    const { eventID } = req.body;
    const { userid } = req.headers;

    const event = await Event.findById(eventID).populate('appliedUsers');
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.__t !== 'IndividualTour') {
      return res.status(400).json({ message: "Can only apply to individual tours" });
    }

    const hasApplied = event.appliedUsers?.some(id => 
      id.toString() === userid.toString()
    );

    if (hasApplied) {
      return res.status(400).json({ message: "You have already applied to this event" });
    }

    if (!event.appliedUsers) {
      event.appliedUsers = [];
    }

    event.appliedUsers.push(userid);
    await event.save();
    
    createLog(userid, 'guide', 'applyToEvent', eventID, 'success', 'Successfully applied to individual tour');
    res.status(200).json({ message: "Successfully applied to event" });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: "Failed to apply to event", error: error.message });
  }
};

exports.unapplyFromEvent = async (req, res) => {
  try {
    const { eventID } = req.body;
    const userid = req.headers.userid || req.user.id; // Try both possible sources

    console.log('Unapply request:', { 
      eventID, 
      userid,
      headers: req.headers,
      body: req.body 
    });

    if (!eventID) {
      return res.status(400).json({ message: "Missing eventID parameter" });
    }

    if (!userid) {
      return res.status(400).json({ message: "Missing userid parameter" });
    }

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.__t !== 'IndividualTour') {
      return res.status(400).json({ message: "Can only unapply from individual tours" });
    }

    // Initialize appliedUsers if it doesn't exist
    if (!event.appliedUsers) {
      event.appliedUsers = [];
    }

    // Check if user has applied
    const hasApplied = event.appliedUsers.some(id => id.toString() === userid.toString());
    if (!hasApplied) {
      return res.status(400).json({ message: "You haven't applied to this event" });
    }

    // Remove user from appliedUsers
    event.appliedUsers = event.appliedUsers.filter(id => id.toString() !== userid.toString());
    await event.save();
    
    createLog(userid, 'guide', 'unapplyFromEvent', eventID, 'success', 'Successfully unapplied from individual tour');
    res.status(200).json({ message: "Successfully unapplied from event" });
  } catch (error) {
    console.error('Unapply error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      headers: req.headers
    });
    res.status(500).json({ 
      message: "Failed to unapply from event", 
      error: error.message 
    });
  }
};

exports.sendNotificationAboutEventToGuide = async (req, res) => {
  try {
    const { eventId, guideId} = req.body;
    const eventID = eventId || req.params.eventID;
    const userid = guideId || req.headers.userid;
    console.log('Send notification request:', { eventID, userid });
    

    const event = await Event.findById(eventID).populate('applicant');
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    const user = await User.findById (userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const notificationTitle = "You Can Assign To An Event!";
    const generateEventDetails = (event) => {
      const { typeStr, visitDate, visitTime, city, district } = event;
      const visitDateStrWithoutTime = visitDate.toISOString().split("T")[0];
      return `${typeStr} on ${visitDateStrWithoutTime} at ${visitTime} , for ${event.applicant.name}  `;
    }
    const notificationMessage = `You can assign to an event with the following details: ${generateEventDetails(event)}, and you have marked the hour of the event as available.`;
    const notificationProps = {
      title: notificationTitle,
      message: notificationMessage,
      recipient: userid,
    };
    await sendNotification(notificationProps);
    createLog(userid, 'guide', 'sendNotificationAboutEventToGuide', eventID, 'success', 'Notification sent to guide about event');
    res.status(200).json({ message: "Notification sent successfully" });
  }
  catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ message: "Failed to send notification", error: error.message });
  }
}

// Generate session token for applicants
exports.generateApplicantSessionToken = async (req, res) => {
  try {
    const { referenceCode } = req.params;
    const { city, district, schoolName } = req.query;

    const query = { referenceCode };

    if (city) query.city = city;
    if (district) query.district = district;
    if (schoolName) {
      query.schoolName = schoolName;
      query.studentHighSchool = schoolName;
    }

    let event = await Event.findOne(query).populate("applicant");
    if (!event) {
      query.schoolName = "";
      query.studentHighSchool = schoolName;
      event = await IndividualTour.findOne(query).populate("applicant");
    }

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const token = jwt.sign(
      { eventId: event._id, applicantId: event.applicant._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating session token:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cancel an event
exports.cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "canceled-by-applicant";
    event.rejectionReason = reason;
    await event.save();

    res.status(200).json({ message: "Event canceled successfully" });
  } catch (error) {
    console.error("Error canceling event:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
