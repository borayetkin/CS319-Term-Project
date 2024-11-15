const Event = require("../models/Event");
const User = require("../models/User");
const SchoolTour = require("../models/SchoolTour");
const IndividualTour = require("../models/IndividualTour");
const Fair = require("../models/Fair");

// Create a school tour
exports.createSchoolTour = async (req, res) => {
  try {
    const {
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

    const schoolTour = new SchoolTour({
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
      visitDate,
      studentHighSchool,
      studentName,
      additionalNotes = "",
      hoursOfWork = 3,
      requiredNumberOfGuides = 1,
      status = "pending",
    } = req.body;

    const individualTour = new IndividualTour({
      visitDate,
      studentHighSchool,
      studentName,
      additionalNotes,
      hoursOfWork,
      requiredNumberOfGuides,
      status,
      typeStr: "Individual Tour",
    });

    const savedTour = await individualTour.save();

    res.status(201).json({
      message: "Individual tour created successfully",
      tour: savedTour,
    });
  } catch (error) {
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
      visitDate,
      location,
      additionalNotes = "",
      hoursOfWork = 3,
      requiredNumberOfGuides = 1,
      status = "pending",
    } = req.body;

    const fair = new Fair({
      visitDate,
      location,
      additionalNotes,
      hoursOfWork,
      requiredNumberOfGuides,
      status,
    });

    const savedFair = await fair.save();

    res.status(201).json({
      message: "Fair created successfully",
      fair: savedFair,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create fair",
      error: error.message,
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a specific event
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
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

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

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
    const { guideID, eventID } = req.body;

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const guide = await User.findById(guideID);
    if (!guide || guide.role !== "guide") {
      return res.status(400).json({ message: "Invalid guide ID" });
    }

    if (!event.assignedGuides.includes(guideID)) {
      event.assignedGuides.push(guideID);
    }

    await event.save();

    res.status(200).json({ message: "Guide assigned successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to assign guide", error: error.message });
  }
};
