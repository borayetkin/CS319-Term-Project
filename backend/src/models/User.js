const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  timeSlots: [
    {
      type: String,
      enum: ["09:00-11:00", "11:00-12:30", "13:30-15:00", "16:00-17:30"],
      required: true,
    },
  ],
});

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
  // Guide Attributes
  bilkentId: {
    type: Number,
  },
  totalWorkHours: {
    type: Number,
    default: 0,
  },
  major: {
    type: String,
    default: ""
  },
  assignedEvents: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
  ],
  completedEvents: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
  ],
  assignedFairs: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Fair", default: [] },
  ],
  completedFairs: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Fair", default: [] },
  ],
  phoneNumber: {
    type: String,
    default: "",
  },
  year: {
    type: Number,
    min: 1,
    max: 4,
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review"
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  availability: [availabilitySchema],
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
  } else{
    return new Error("Event already assigned")
  }
};
userSchema.methods.removeAssignedEvent = function (eventId) {
  const index = this.assignedEvents.indexOf(eventId);
  if (index > -1) {
    this.assignedEvents.splice(index, 1);
    return this.save();
  } else {
    return Promise.reject(new Error("Event not assigned"));
  }
};
userSchema.methods.completeEvent = function (eventId, workHours) {
  // Remove from assigned events if it exists
  const assignedIndex = this.assignedEvents.indexOf(eventId);
  if (assignedIndex > -1) {
    this.assignedEvents.splice(assignedIndex, 1);
  }

  // Remove from assigned fairs if it exists
  const fairIndex = this.assignedFairs.indexOf(eventId);
  if (fairIndex > -1) {
    this.assignedFairs.splice(fairIndex, 1);
  }

  // Add to completed events if not already there
  if (!this.completedEvents.includes(eventId)) {
    this.completedEvents.push(eventId);
  }

  // Update work hours
  if (!this.totalWorkHours) {
    this.totalWorkHours = 0;
  }
  this.totalWorkHours += workHours;

  return this.save();
};
userSchema.methods.takeBackCompletedEvent = function (eventId,workHours) {
  if (this.completedEvents.includes(eventId)) {
    let ind = this.completedEvents.indexOf(eventId);
    this.completedEvents.splice(ind, 1);
    this.totalWorkHours -= workHours;
    this.assignedEvents.push(eventId);
    return this.save();
  } else {
    return Promise.reject(new Error("Event not completed"));
  }
}
userSchema.methods.addAssignedFair = function (fairId) {
  if (!this.assignedFairs.includes(fairId)) {
    this.assignedFairs.push(fairId);
    return this.save();
  } else {
    return Promise.reject(new Error("Fair already assigned"));
  }
};

userSchema.methods.removeAssignedFair = function (fairId) {
  const index = this.assignedFairs.indexOf(fairId);
  if (index > -1) {
    this.assignedFairs.splice(index, 1);
    return this.save();
  } else {
    return Promise.reject(new Error("Fair not assigned"));
  }
};

userSchema.methods.applyToFair = function (fairID){
    // To be implemented
}
userSchema.methods.updateContactInfo = function(email, phone) {
  if (email) this.email = email;
  if (phone) this.phone = phone;
  return this.save();
};

userSchema.methods.setAvailability = function (availability) {
  this.availability = availability;
  return this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;