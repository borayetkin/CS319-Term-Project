const User = require("../models/User");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");


exports.saveUser = async ({ name, email, password, role, birthdate }) =>{
    // Create new user with conditional role
    const user = new User({ name, email, password, role, birthdate });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return token;
}
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      user[key] = req.body[key] || user[key];
    });

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
exports.userUpdateAssignedDay = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    await user.updateAssignedDay(req.body.day);
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.userAcceptTour = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    await user.acceptTour(req.body.tourId);
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.userAddAssignedEvent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    await user.addAssignedEvent(req.body.eventId);
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.userCompleteEvent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    await user.completeEvent(req.body.eventId);
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.userApplyToFair = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    await user.applyToFair(req.body.fairID);
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
};