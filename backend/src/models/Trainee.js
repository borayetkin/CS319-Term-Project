const mongoose = require("mongoose");
const User = require('./User');

const traineeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  currentTraineeship: {
    status: {
      type: String,
      enum: ["pending", "interview-pending","interview-accepted", "interview-rejected","rejected"],
      default: "pending",
    },
    interviewDate: {
      type: Date,
    },
    applicationDate: {
      type: Date,
      default: Date.now(),
    },
  },
  department: {
    type: String,
    required: true,
  },
  traineeships: [
    {
      status: {
        type: String,
        enum: ["pending", "interview-pending","interview-accepted", "interview-rejected","rejected"],
        default: "pending",
      },
      interviewDate: {
        type: Date,
      },
      applicationDate: {
        type: Date,
        default: Date.now(),
      },
    }
    
  ],
  schoolID: {
    unique: true,
    type: Number,
    required: true,
  },
});




const Trainee = mongoose.model("Trainee", traineeSchema);
module.exports = Trainee;
