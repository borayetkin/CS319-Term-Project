// tourController.js
const SchoolTour = require("../models/SchoolTour");
const Tour = require("../models/Tour");
const Applicant = require("../models/Applicant");

// Create a new tour
exports.createTour = async (req, res) => {
  const { schoolName, contactPerson, email, visitDate, studentCount } =
    req.body;

  try {
    const newTour = new Tour({
      schoolName,
      contactPerson,
      email,
      visitDate,
      studentCount,
    });
    await newTour.save();
    res.status(201).json(newTour);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Create a new applicant and connect to the tour

exports.createApplicantAndTour = async (req, res) => {
  const { schoolName, contactPerson, email, visitDate, studentCount,phoneNumber } = req.body;
  
  
  try {
    const newTour = new SchoolTour({
      schoolName,
      contactPerson,
      email,
      visitDate,
      studentCount,
    });
    await newTour.save();
    
    console.log(newTour._id);
    const newApplicant = new Applicant({
      name: schoolName,
      email: email,
      event: newTour._id,
      phoneNumber: phoneNumber
    });
    await newApplicant.save();

    res.status(201).json({ tour: newTour, applicant: newApplicant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all tours
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.json(tours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch a specific tour by ID
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
