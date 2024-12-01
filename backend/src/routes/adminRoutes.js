const express = require("express");
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getUserStats,
} = require("../controllers/UserController");
const adminAuth = require("../middleware/adminMiddleware"); // Middleware for admin-only access
const router = express.Router();

// Admin route to fetch all users (protected by admin role)
router.get("/admin/users", adminAuth, getAllUsers); // Only admins can access this

// Admin route to delete a user by ID
router.delete("/admin/users/:id", adminAuth, deleteUser);

// Admin route to update a user's role
router.put("/admin/users/:id/role", adminAuth, updateUserRole);

// Route for user statistics
router.get("/users/stats", adminAuth, getUserStats);

module.exports = router;
