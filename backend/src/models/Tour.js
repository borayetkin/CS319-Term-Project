const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  studentCount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
