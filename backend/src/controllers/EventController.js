const Event = require("../models/Event");
const User = require("../models/User");
const Advisor = require("../models/Advisor");
const SchoolTour = require("../models/SchoolTour");
const IndividualTour = require("../models/IndividualTour");
const Applicant = require("../models/Applicant");
const { sendConfirmationEmail } = require("../config/EmailService");
const { sendReviewEmail } = require("../config/EmailService");

// Get events with status "accepted"
exports.getAcceptedEvents = async (req, res) => {
  try {
    const acceptedEvents = await Event.find({ status: "accepted" })
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
      studentCount,
      additionalNotes,
      phoneNumber,
      reserveDates
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
      studentCount,
      additionalNotes,
      phoneNumber,
      reserveDates: reserveDates ? reserveDates.map(date => { return {visitDate : new Date(date.date), visitTime : date.time}}) : [],
    });
    schoolTour.setRequiredNumberOfGuides();
    schoolTour.addToApplicantEvents();
    schoolTour.setWeekday();

    await schoolTour.save();
    res.status(201).json({
      message: "School tour created successfully",
      schoolTour,
    });
  } catch (error) {
    console.error(error)
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
      typeStr: "Individual Tour",
    });
    individualTour.addToApplicantEvents();
    individualTour.setWeekday();

    const savedTour = await individualTour.save();

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
          "canceled-verified",
          "canceled-non-verified",
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

    return res.status(200).json({ message: "Tour application accepted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, event } = req.body;

    if (status === "accepted" || status === "rejected") {
      const applicant = await Applicant.findById(event.applicant);
      if (applicant) {
        await sendConfirmationEmail(applicant.email, applicant.name, status);
      }
      if (status === "accepted") {
        return await acceptTourApplication(req, res);
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
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
    const event = await Event.findByIdAndDelete(eventId);
    try {
      const applicant = await Applicant.findByIdAndDelete(
        event.applicant.applicantID
      );
      await deleteEventFromUsers(eventId);
    } catch (error) {
      console.error(error);
    }
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    await event.removeFromAssigneesEvents();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
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
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the guide ID is valid
    const guide = await User.findById(userID);
    if (!guide) {
      return res.status(400).json({ message: "Invalid guide ID" });
    }

    // Check if the number of assigned guides exceeds the limit
    if (event.assignedUsers.length >= event.requiredNumberOfGuides) {
      return res.status(400).json({
        message: `Cannot assign more than ${event.requiredNumberOfGuides} guide(s) to this event.`,
      });
    }
    // Check if the guide is already assigned
    if (event.assignedUsers.includes(userID)) {
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
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Failed to assign guide", error: error.message });
    }

    res.status(200).json({ message: "Guide assigned successfully" });
  } catch (error) {
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

    /*
    const reviewLink = `http://localhost:5173/review/${eventId}`;

    // Populate the applicant data from the event
    await event.populate('applicant'); // Wait for population to complete
    const applicant = event.applicant;

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Send the review email
    await sendReviewEmail(applicant.email, applicant.name, reviewLink);
    */


    await Event.findByIdAndUpdate(eventId, { status: "canceled-resubmission-requested" });
    res.status(200).json({ message: "Event marked as cancelled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to cancel event", error: error.message });
  }
};
exports.markEventAsCompleted = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const workHours = req.body.workHours;
   


  

    // Fetch event by ID
    let event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    let user = await User.findById (userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if the user is assigned to the event
    if (!event.isUserAssigned(userId)) {
      return res
        .status(403)
        .json({ message: "User not assigned to this event" });
    }
    try {
        await user.completeEvent(eventId, workHours);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    event.hoursOfWork = workHours;
    // Update event status to "completed-non-verified"
    event.status = "completed-verified";
    await event.save();  // Save the updated event

    // Generate review link
    const reviewLink = `http://localhost:5173/review/${eventId}`;

    // Populate the applicant data from the event
    await event.populate('applicant'); // Wait for population to complete
    const applicant = event.applicant;

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Send the review email
    await sendReviewEmail(applicant.email, applicant.name, reviewLink);

    // Respond with success
    res.status(200).json({
      message: "Event marked as completed successfully, review email sent.",
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to complete event", error: error.message });
  }
};

exports.takeBackEventAction = async (req, res) => {
  try {
    console.log("takeBackEventAction");
    const { eventId } = req.params;
    const userId = req.user.id;
    const event = await Event.findById(eventId);
    if (!event.isUserAssigned(userId)) {
      return res
        .status(403)
        .json({ message: "User not assigned to this event" });
    }
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    try {
      await event.takeBackAction();
    } catch (error) {
      res.status(400).json({ message: "Event status not eligible for action" });
    }
    let user = await User.findById(userId);

    await user.takeBackCompletedEvent(eventId, event.hoursOfWork);
   
    res.status(200).json({ message: "Event status set back to accepted" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to take back event", error: error.message });
  }
};

exports.confirmEventAction = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (!event.assignedAdvisor === userId) {
      return res
        .status(403)
        .json({ message: "Advisor not assigned to this event" });
    }
    try {
      await event.markVerified();
      res
        .status(200)
        .json({ message: "Event completion/cancellation confirmed" });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Event status not eligible for confirmation" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to confirm event completion",
      error: error.message,
    });
  }
};
exports.applyToEvent = async (req, res) => {
  try {
    const { eventID } = req.body;
    const { userrole, userid } = req.headers;
    const user = await User.findById(userid || req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.appliedUsers.includes(userid)) {
      return res
        .status(400)
        .json({ message: "Guide is already assigned to this event." });
    }

    // Assign the guide to the event
    event.appliedUsers.push(userid);

    await event.save();

    // Add the event to the guide's list of assigned events
    res.status(200).json({ message: "Applied to event successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
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
