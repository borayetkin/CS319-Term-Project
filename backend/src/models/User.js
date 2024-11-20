const mongoose = require("mongoose");
const Tour = require("./Tour");
const Event = require("./Event");
const SchoolTour = require('./SchoolTour');
const IndividualTour = require("./IndividualTour");


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
    enum: ["guide", "coordinator", "advisor", "admin"],
    required: true,
  },
  assignedDay: {
    type: String,
  },
  acceptedTours: [
    {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
      default: [],
    },
  ],
  // Guide Attributes
  bilkentId: {
    type: Number,
  },
  totalWorkHours: {
    type: Number,
    default: 0,
  },
  assignedEvents: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
  ],
  completedEvents: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
  ],
});
userSchema.methods.updateAssignedDay = function updateAssignedDay(day) {
  this.assignedDay = day;
  return this.save();
};
userSchema.methods.acceptTour = function acceptTour(tourId) {
  if (!this.acceptedTours.includes(tourId)) {
    this.acceptedTours.push(tourId);
    return this.save();
  } else {
    return Promise.reject(new Error("Tour has already been accepted"));
  }
};
userSchema.methods.addAssignedEvent = function (eventId) {
  if (!this.assignedEvents.includes(eventId)) {
    this.assignedEvents.push(eventId);
  } else {
    return Promise.reject(new Error("Event already assigned"));
  }
};
userSchema.methods.completeEvent = function (eventId) {
  if (this.assignedEvents.includes(eventId)) {
    let ind2 = this.completedEvents.indexOf(eventId);
    if (ind2 > -1) {
      return Promise.reject(new Error("Event already completed"));
    } else {
      let ind = this.assignedEvents.indexOf(eventId);
      if (ind > -1) {
        this.assignedEvents.splice(ind, 1);
        this.completedEvents.push(eventId);
        return this.save();
      } else {
        return Promise.reject(new Error("Event not assigned"));
      }
    }
  } else {
    return Promise.reject(new Error("Server Error"));
  }
};
userSchema.methods.applyToFair = function (fairID){
    // To be implemented
}
const User = mongoose.model("User", userSchema);
module.exports = User;