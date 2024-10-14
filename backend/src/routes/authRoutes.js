const express = require("express");
const { loginUser, registerUser } = require("../controllers/authController"); // Fixing the import
const router = express.Router();

// Login route
router.post("/login", loginUser);

// Register route
router.post("/register", registerUser); // Using correct function name from authController

module.exports = router;
