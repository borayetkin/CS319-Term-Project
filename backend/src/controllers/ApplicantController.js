const Applicant = require("../models/Applicant");
const { deleteEvent } = require("./EventController");
const { sendConfirmationEmail } = require("../config/EmailService");
const Event = require("../models/Event");

// Create a new applicant
exports.createApplicant = async (req, res) => {
  try {
    const { name, email, phoneNumber, schoolID } = req.body;

    // Check if applicant already exists
    if (schoolID) {
      const existingApplicant = await Applicant.findOne({ schoolID: schoolID });

      if (existingApplicant) {
        // Send a notification email even if the applicant exists
        // await sendConfirmationEmail(
        //   existingApplicant.email,
        //   existingApplicant.name
        // );
        return res.status(201).json(existingApplicant);
      }
    }

    // Validate input fields
    if (!name || !email || !phoneNumber) {
      return res.status(400).send("All fields are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format");
    }

    // Additional validation (e.g., phone number format) can be added here

    // Create and save the applicant
    const applicant = new Applicant(req.body);
    await applicant.save();

    // Send confirmation email
    // await sendConfirmationEmail(email, name);

    res.status(201).json(applicant);
  } catch (error) {
    console.error("Error in createApplicant:", error.message);
    res.status(500).send("Server error");
  }
};

// Get all applicants
exports.getAllApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find();
    res.status(200).send(applicants);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
// Add an event to an applicant using saveEvent method
exports.addEventToApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      return res.status(404).send("Applicant not found");
    }
    const { event } = req.body;
    if (!event) {
      return res.status(400).send("Event is required");
    }
    await applicant.saveEvent(event);
    res.status(200).send(applicant);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
exports.getApplicantById = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      return res.status(404).send("Applicant not found");
    }
    res.status(200).json(applicant);
  } catch (error) {
    console.error(error);

    res.status(500).send("Server error");
  }
};
// Update an applicant by ID
exports.updateApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!applicant) {
      return res.status(404).send("Applicant not found");
    }
    res.status(200).send(applicant);
  } catch (error) {
    console.error(error);
    res.status(400).send("Server error");
  }
};
const deleteApplicantApplications = async (applicantId) => {
  const events = await Event.find();
  events.forEach(async (event) => {
    if (event.applicant === applicantId) {
      deleteEvent({ eventId: event._id });
    }
  });
};
// Delete an applicant by ID
exports.deleteApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) {
      return res.status(404).send();
    }
    deleteApplicantApplications(req.params.id);
    res.status(200).send(applicant);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
