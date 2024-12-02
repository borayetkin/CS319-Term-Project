const Event = require("../models/Event");
const User = require("../models/User");
const Advisor = require("../models/Advisor");
const SchoolTour = require("../models/SchoolTour");
const IndividualTour = require("../models/IndividualTour");
const Fair = require("../models/Fair");
const mongoose = require("mongoose");

const ApplicantController = require("./ApplicantController");
const Applicant = require("../models/Applicant");
// Get events with status "accepted"

exports.getAcceptedEvents = async (req, res) => {
  try {
    const acceptedEvents = await Event.find({ status: "accepted" });
    for (let i = 0; i < acceptedEvents.length; i++) {
      acceptedEvents[i] = acceptedEvents[i].toJSON();
      let application = acceptedEvents[i];
      const applicantData = await Applicant.findById(
        application.applicant.applicantID
      );
      if (applicantData) {
        application.applicant = {
          ...application.applicant,
          name: applicantData.name,
          email: applicantData.email,
          phoneNumber: applicantData.phoneNumber,
        };
      }
    }
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
      });
      for (let i = 0; i < acceptedEvents.length; i++) {
        acceptedEvents[i] = acceptedEvents[i].toJSON();
        let application = acceptedEvents[i];
        const applicantData = await Applicant.findById(
          application.applicant.applicantID
        );
        if (applicantData) {
          application.applicant = {
            ...application.applicant,
            name: applicantData.name,
            email: applicantData.email,
            phoneNumber: applicantData.phoneNumber,
          };
        }
      }
      res.status(200).json(acceptedEvents);
    } else {
      const acceptedEvents = await Event.find({ status: "accepted" });
      res.status(200).json(acceptedEvents);
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
      const acceptedEvents = await Event.find({ weekday: user2.assignedDay });
      for (let i = 0; i < acceptedEvents.length; i++) {
        acceptedEvents[i] = acceptedEvents[i].toJSON();
        let application = acceptedEvents[i];
        const applicantData = await Applicant.findById(
          application.applicant.applicantID
        );
        if (applicantData) {
          application.applicant = {
            ...application.applicant,
            name: applicantData.name,
            email: applicantData.email,
            phoneNumber: applicantData.phoneNumber,
          };
        }
      }

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
    } = req.body;

    if (!applicant || !schoolName || !contactPerson || !email || !visitDate || !visitTime || !city || !studentCount || !phoneNumber) {
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

// Create a fair
exports.createFair = async (req, res) => {
  try {
    const {
      applicant,
      schoolName,
      email,
      phoneNumber,
      city,
      visitDate,
      fairTime,
      location,
      additionalNotes = "",
      hoursOfWork = 6,
      requiredNumberOfGuides = 1,
      status = "pending",
    } = req.body;

    // Validate required fields
    if (
      !applicant ||
      !visitDate ||
      !fairTime ||
      !location ||
      !email ||
      !phoneNumber
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fair = new Fair({
      applicant,
      schoolName,
      email,
      phoneNumber,
      city,
      visitDate: new Date(visitDate),
      visitTime: fairTime,
      fairTime,
      location,
      additionalNotes,
      hoursOfWork,
      requiredNumberOfGuides,
      status,
    });

    fair.addToApplicantEvents(); // Ensure this method is implemented
    fair.setWeekday(); // Set the weekday

    await fair.save();

    res.status(201).json({
      message: "Fair created successfully",
      fair,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create fair",
      error: error.message,
    });
  }
};
// Get all fairs
exports.getFairs = async (req, res) => {
  try {
    const fairs = await Fair.find();
    for (let i = 0; i < fairs.length; i++) {
      fairs[i] = fairs[i].toJSON();
      let application = fairs[i];
      const applicantData = await Applicant.findById(
        application.applicant.applicantID
      );
      if (applicantData) {
        application.applicant = {
          ...application.applicant,
          name: applicantData.name,
          email: applicantData.email,
          phoneNumber: applicantData.phoneNumber,
        };
      }
    }
    res.status(200).json(fairs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    for (let i = 0; i < events.length; i++) {
      events[i] = events[i].toJSON();
      let application = events[i];
      const applicantData = await Applicant.findById(
        application.applicant.applicantID
      );
      if (applicantData) {
        application.applicant = {
          ...application.applicant,
          name: applicantData.name,
          email: applicantData.email,
          phoneNumber: applicantData.phoneNumber,
        };
      }
    }
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a specific event
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the event by ID
    let event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event = event.toJSON();

    // Fetch the assigned advisor (if available)
    if (event.assignedAdvisor) {
      const advisor = await User.findById(event.assignedAdvisor);
      event.assignedAdvisor = advisor
        ? advisor.toJSON()
        : { name: "N/A", email: "N/A" };
    }

    // Fetch the applicant details (if available)
    const applicantData = await Applicant.findById(event.applicant.applicantID);
    if (applicantData) {
      event.applicant = {
        ...event.applicant,
        name: applicantData.name,
        email: applicantData.email,
        phoneNumber: applicantData.phoneNumber,
      };
    } else {
      event.applicant = {
        name: "N/A",
        email: "N/A",
        phoneNumber: "N/A",
      };
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error in getEvent:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { userrole, userid } = req.headers;
    const { eventId } = req.params;
    if (req.body.status && req.body.status == "accepted") {
      try {
        const foundUser = await User.findById(userid);
        if (foundUser.role !== "advisor") {
          return res.status(401).json({
            message: "Coordinators cannot accept applications",
          });
        }

        const advisor = new Advisor(foundUser);
        await advisor.acceptTourApplication(eventId);
        await advisor.save();

        return res.status(200).json({
          message: "Event updated successfully",
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    } else {
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
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndDelete(eventId);
    const applicant = await Applicant.findByIdAndDelete(
      event.applicant.applicantID
    );

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

    const event = await Event.findById(eventID);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const guide = await User.findById(userID);
    if (!guide) {
      return res.status(400).json({ message: "Invalid guide ID" });
    }

    if (!event.assignedUsers.includes(userID)) {
      event.assignedUsers.push(userID);
    }

    await event.save();

    try {
      guide.addAssignedEvent(eventID);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Failed to assign guide", error: error.message });
    }
    await guide.save();
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
      return res.status(404).json({ message: error.message });
    }

    // const guideIndex = event.assignedGuides.indexOf(guideID);
    // if (guideIndex === -1) {
    //   return res.status(400).json({ message: "Guide not assigned to this event" });
    // }

    // event.assignedGuides.splice(guideIndex, 1);
    // await event.save();

    res.status(200).json({ message: "Guide removed successfully" });
  } catch (error) {
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

  schoolTours.forEach(tour => {
    const dateKey = tour.visitDate.toISOString().split('T')[0] + `-${tour.visitTime}`;
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
