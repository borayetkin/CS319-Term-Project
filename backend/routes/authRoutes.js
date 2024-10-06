/*const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;*/

// /routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const router = express.Router();

// POST request to register a new user
router.post("/register", registerUser);

// POST request for user login
router.post("/login", loginUser);

module.exports = router;
