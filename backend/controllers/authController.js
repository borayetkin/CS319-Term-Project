const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if all fields are provided
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with token and redirect URL
    //res.status(201).json({ token, redirectUrl: "/homepage.html" }); // Redirect to homepage after successful signup
    res.redirect("/homepage.html"); // Server-side redirect
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with token and redirect URL
    //res.status(200).json({ token, redirectUrl: "/homepage.html" }); // Redirect to homepage after successful login
    res.redirect("/homepage.html"); // Server-side redirect
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
