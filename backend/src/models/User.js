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
  }
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
userSchema.methods.completeEvent = function (eventId, workHour) {
  if (this.assignedEvents.includes(eventId)) {
    let ind2 = this.completedEvents.indexOf(eventId);
    if (ind2 > -1) {
      return Promise.reject(new Error("Event already completed"));
    } else {
      let ind = this.assignedEvents.indexOf(eventId);
      if (ind > -1) {
        this.assignedEvents.splice(ind, 1);
        this.completedEvents.push(eventId);
        this.totalWorkHours += parseFloat(workHour);
        return this.save();
      } else {
        return Promise.reject(new Error("Event not assigned"));
      }
    }
  } else {
    return Promise.reject(new Error("Server Error"));
  }
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


const User = mongoose.model("User", userSchema);
module.exports = User;