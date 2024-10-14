const Tour = require("../models/Tour");

// Create a new tour (no authentication required)
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

// Fetch all tours (for logged-in users only)
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find(); // Fetch all tours
    res.json(tours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
