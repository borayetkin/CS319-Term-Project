const mongoose = require("mongoose");
const User = require("./User");
const Event = require("./Event");
const SchoolTour = require("./SchoolTour");

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
  dayApplications:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] }],

});

advisorSchema.methods.updateAssignedDay = function (day) {
  this.assignedDay = day
  return this.save()
}
advisorSchema.methods.acceptTourApplication = async function (eventID) {
  try {
  
    this.dayApplications.push(eventID);

    return Event.findByIdAndUpdate(eventID, {status: "accepted" , assignedAdvisor: this._id});
    
  } catch (error) {
    
    return Promise.reject(new Error("Server Error"))
  }
}
advisorSchema.methods.addDayApplication = function (eventID) {
  this.dayApplications.push(eventID)
  return this.save()
}


const Advisor = User.discriminator("Advisor", advisorSchema);
Object.assign(advisorSchema.methods, User.schema.methods);

module.exports = Advisor;
