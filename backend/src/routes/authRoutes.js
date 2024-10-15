// const express = require("express");
// const {
//   loginUser,
//   signupUser,
//   getProfile,
//   updateProfile,
// } = require("../controllers/authController");
// const auth = require("../middleware/authMiddleware"); // For protecting routes
// const router = express.Router();

// // Login route
// router.post("/login", loginUser);

// // Register route
// router.post("/signup", signupUser);

// // Get user profile (protected route)
// router.get("/profile", auth, getProfile);

// // Update user profile (protected route)
// router.put("/profile", auth, updateProfile);

// module.exports = router;

const express = require("express");
const {
  loginUser,
  signupUser,
  getProfile,
  updateProfile,
  getAllUsers, // Add controller for getting all users
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware"); // Middleware for protecting routes
const adminAuth = require("../middleware/adminMiddleware"); // Middleware for admin-only access
const router = express.Router();

// Login route
router.post("/login", loginUser);

// Register route
router.post("/signup", signupUser);

// Get user profile (protected route)
router.get("/profile", auth, getProfile);

// Update user profile (protected route)
router.put("/profile", auth, updateProfile);

// Admin route to fetch all users (protected by admin role)
router.get("/admin/users", adminAuth, getAllUsers); // Only admins can access this

module.exports = router;
