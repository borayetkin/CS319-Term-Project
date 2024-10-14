// const express = require("express");
// const { loginUser, registerUser } = require("../controllers/authController"); // Fixing the import
// const router = express.Router();

// // Login route
// router.post("/login", loginUser);

// // Register route
// router.post("/register", registerUser); // Using correct function name from authController

// module.exports = router;

const express = require("express");
const {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware"); // For protecting routes
const router = express.Router();

// Login route
router.post("/login", loginUser);

// Register route
router.post("/signup", registerUser);

// Get user profile (protected route)
router.get("/profile", auth, getProfile);

// Update user profile (protected route)
router.put("/profile", auth, updateProfile);

module.exports = router;
