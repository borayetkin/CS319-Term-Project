const mongoose = require("mongoose");
const User = require('./User');
const Applicant = require('./Applicant');
const eventSchema = new mongoose.Schema({
  applicant: {
    type:{type: mongoose.Schema.Types.ObjectId, ref: 'Applicant'}, // For now, will be updated with a new applicant class
  },
  visitDate : {
    type: Date,
    required : true
  },
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reqiredNumberOfGuides : {
    type: Number,
    default : 1
  },
  status : {
    type: String,
    enum : ["pending", "accepted", "rejected"],
    default: "pending"
  },
  hoursOfWork : {
    type : Number,
    default : 3
  },
  applicationDate : {
    type: Date,
    default : Date.now()
  },
  typeStr :{
    type: String,
    enum : ["Individual Tour", "School Tour", "Fair"]
  },
  additionalNotes :{
    type: String,
    default : ""
  }
});

eventSchema.methods.changeDate =  function (date ){
    this.date = date
    return this.save()
}
eventSchema.methods.changeStatus = function (status){
    this.status = status
    return this.save()
}
eventSchema.methods.addAssignee = function (userId){
    if(!this.assignedUsers.includes(userId)){
        this.assignedUsers.push(userId)
        return this.save()
       }else {
        return Promise.reject(new Error('User has already been assigned'))
       }
}
eventSchema.methods.removeAssignee = function (userId){
    const index = this.assignedUsers.indexOf(userId);

  if (index > -1) {
    this.assignedUsers.splice(index, 1); // Remove the course at the found index
    return this.save();
  } else {
    return Promise.reject(new Error('Guide not found in the Event\'s assignees'));
  }
}

/**
 * Returns an array of assigned user id's
 * 
 *
 * @returns {Array} 
 * 
 */
eventSchema.methods.getAssignees = function () {
    return this.assignedUsers
}

/**Returns the Applicant name for now*/
eventSchema.methods.getApplicant = function () {
    return this.applicant
}

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
