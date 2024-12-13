const express = require("express");
const {
  loginUser,
  signupUser,
  getProfile,
  updateUser,
  getAllUsers,
  getAllGuides,
  searchUsers,
  checkAuthUser,
  getAdvisorInfo
} = require("../controllers/UserController");
const auth = require("../middleware/authMiddleware"); // Middleware for protecting routes
const adminAuth = require("../middleware/adminMiddleware"); // Middleware for admin-specific routes
const advisorAuth = require("../middleware/advisorMiddleware");
const router = express.Router();

const userController = require('../controllers/UserController');


// Login route
router.post("/login", loginUser);

// Register route
router.post("/signup", signupUser);

// Get user profile (protected route)
router.get("/profile", auth, getProfile);
router.get("/check",auth,checkAuthUser)
// Update user profile (protected route)
router.put("/profile", auth, updateUser);

// Get all users (admin-only route)
router.get("/users", [auth, adminAuth], getAllUsers);
router.get("/guides", auth, getAllGuides);

router.get("/user-search",auth,searchUsers)
router.get("/advisor-info", auth, getAdvisorInfo);
module.exports = router;

router.put('/update-contact', auth, userController.updateUserFromProfile);
