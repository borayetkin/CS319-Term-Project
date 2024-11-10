//

const express = require("express");
const {
  loginUser,
  signupUser,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware"); // Middleware for protecting routes
const router = express.Router();

// Login route
router.post("/login", loginUser);

// Register route
router.post("/signup", signupUser);

// Get user profile (protected route)
router.get("/profile", auth, getProfile);

// Update user profile (protected route)
router.put("/profile", auth, updateProfile);

module.exports = router;
