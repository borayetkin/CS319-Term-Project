const express = require("express");
const path = require("path");
const fs = require("fs");

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

const filePath = path.join(__dirname, "../data/high_schools_list.json");

// Update school priority
router.put("/high-schools/:id", (req, res) => {
  const { id } = req.params;
  const updatedSchool = req.body;

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file." });

    const schools = JSON.parse(data);
    const index = schools.findIndex((school) => school.id === parseInt(id));
    if (index === -1) return res.status(404).json({ message: "School not found." });

    schools[index] = updatedSchool;

    fs.writeFile(filePath, JSON.stringify(schools, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing file." });
      res.json(updatedSchool);
    });
  });
});


module.exports = router;
