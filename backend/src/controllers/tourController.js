// tourController.js
const Tour = require("../models/Tour");

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
