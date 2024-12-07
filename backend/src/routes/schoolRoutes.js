const express = require("express");
const path = require("path");

const router = express.Router();

// Route to get the high schools list
router.get("/high-schools", (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/high_schools_list.json");
    const highSchools = require(filePath);
    res.json(highSchools);
  } catch (error) {
    res.status(500).json({ message: "Failed to load high schools data." });
  }
});

module.exports = router;
