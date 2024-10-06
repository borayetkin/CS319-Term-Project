/*const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Guide", "Advisor", "Coordinator"],
    default: "Guide",
  },
});

module.exports = mongoose.model("User", userSchema);*/

// /models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["guide", "coordinator", "advisor"], // Add 'advisor' here
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
