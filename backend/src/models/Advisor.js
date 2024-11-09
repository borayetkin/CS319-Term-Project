const mongoose = require("mongoose");
const User = require("./User");
const Event = require("./Event");

const advisorSchema = new mongoose.Schema({
  assignedDay: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  dayApplications: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] }],
  },
});

advisorSchema.methods.updateAssignedDay = function (day) {
  this.assignedDay = day
  return this.save()
}
advisorSchema.methods.acceptTourApplication = function (eventID) {
  try {
    return Event.findByIdAndUpdate(eventID, {status: "accepted"})
    
  } catch (error) {
    return Promise.reject(new Error("Server Error"))
  }
}
advisorSchema.methods.addDayApplication = function (eventID) {
  this.dayApplications.push(eventID)
  return this.save()
}


const Advisor = User.discriminator("Advisor", advisorSchema);
module.exports = Advisor;
