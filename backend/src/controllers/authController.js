const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { saveUser } = require("./UserController");

// Register a new user
exports.signupUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all fields." });
  }

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assign role based on criteria
    const isAdminEmail = email === "admin1@gmail.com"; // Replace with actual admin logic
    const userRole = isAdminEmail ? "admin" : role;

    // Save the new user
    const newUser = await saveUser({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, message: "User registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all fields." });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Login successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Get the current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};

// Update the user's profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully.", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating profile." });
  }
};

// Get all users (admin-only functionality)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};
