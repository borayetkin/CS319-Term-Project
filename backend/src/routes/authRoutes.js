const express = require("express");
const {
  loginUser,
  signupUser,
  getProfile,
  updateUser,
  getAllUsers,
} = require("../controllers/UserController");
const auth = require("../middleware/authMiddleware"); // Middleware for protecting routes
const adminAuth = require("../middleware/adminMiddleware"); // Middleware for admin-specific routes
const router = express.Router();

// Login route
router.post("/login", loginUser);

// Register route
router.post("/signup", signupUser);

// Get user profile (protected route)
router.get("/profile", auth, getProfile);
router.get("/check",auth)
// Update user profile (protected route)
router.put("/profile", auth, updateUser);

// Get all users (admin-only route)
router.get("/users", [auth, adminAuth], getAllUsers);

module.exports = router;
