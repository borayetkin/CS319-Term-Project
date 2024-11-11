const Event = require("../models/Event");
const User = require("../models/User");
const SchoolTour = require("../models/SchoolTour");
const IndividualTour = require("../models/IndividualTour");
const Fair = require("../models/Fair");


module.exports.createSchoolTour = async (req, res) => {
    try {
        const schoolTour = new SchoolTour({
            schoolName: req.body.schoolName,
            contactPerson: req.body.contactPerson,
            email: req.body.email,
            visitDate: new Date(req.body.visitDate),
            visitTime: req.body.visitTime,
            city: req.body.city,
            studentCount: req.body.studentCount,
            additionalNotes: req.body.additionalNotes,
            phoneNumber: req.body.phoneNumber
        });
        await schoolTour.save();

        res.status(201).json({ 
            message: 'School tour created successfully',
            schoolTour
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating school tour', 
            error: error.message 
        });
    }
};
module.exports.createIndividualTour = async (req, res) => {
  const { 
    visitDate, 
    studentHighSchool, 
    studentName, 
    additionalNotes = "", 
    hoursOfWork = 3, 
    requiredNumberOfGuides = 1, 
    status = "pending" 
  } = req.body;
  
  let tour = new IndividualTour({
    visitDate,
    studentHighSchool,
    studentName,
    additionalNotes,
    hoursOfWork,
    requiredNumberOfGuides,
    status,
    typeStr: "Individual Tour"
  });
  try {
    const savedTour = await tour.save();
    res.status(201).json(savedTour);
  } catch (error) {
    res.status(500).json({ error: "Failed to create individual tour" });
  }
};

module.exports.createFair = async (req, res) => {
  const { visitDate, location, additionalNotes = "", hoursOfWork = 3, requiredNumberOfGuides = 1, status = "pending" } = req.body;
  let fair = new Fair({
    visitDate,
    location,
    additionalNotes,
    hoursOfWork,
    requiredNumberOfGuides,
    status,
  });
  try {
    const savedFair = await fair.save();
    res.status(201).json(savedFair);
  } catch (error) {
    res.status(500).json({ error: "Failed to create fair" });
  }
};

module.exports.destroyEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Id not found" });
    }
    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports.getEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports.updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const eventProp = req.body;
  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, eventProp, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports.asignAdvisorToTour = async (req, res) => {
  const { advisorID, eventID } = req.body;
  try {
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ error: "Event Not Found" });
    }
    const advisor = await User.findById(advisorID);
    if (!advisor) {
      return res.status(404).json({ error: "User Not Found" });
    }
    if (advisor.role === "advisor" || advisor.role === "coordinator" || advisor.role === "admin") {
      event.setAssignedAdvisor(advisorID);
      await event.save();
      res.status(200).json({ message: "Advisor assigned successfully" });
    } else {
      res.status(400).json({ error: "User is not an advisor or above" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports.notifyCoordinatorAboutFair = (req, res) => {
  // To Be Implemented
  res.status(501).json({ message: "Not implemented" });
};

module.exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await Event.findByIdAndDelete(eventId);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};


