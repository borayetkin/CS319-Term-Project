const mongoose = require("mongoose");
const User = require('./User');
const Applicant = require('./Applicant');

const eventSchema = new mongoose.Schema({
  applicant:  {type: mongoose.Schema.Types.ObjectId, ref: 'Applicant'},
// For now, will be updated with a new applicant class

  visitDate : {
    type: Date,
    required : true
  },
  visitTime : {
    type: String,
    required : true
  },
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []
  }],
  appliedUsers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []
  }],
  requiredNumberOfGuides : {
    type: Number,
    default : 1
  },
  status : {
    type: String,
    enum : ["pending", "scheduled", "accepted", "rejected","canceled-resubmission-requested","completed-non-verified","completed-verified"],
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
    enum : ["Individual Tour", "School Tour"]
  },
  additionalNotes :{
    type: String,
    default : ""
  },
  weekday : {
    type : String,
    default: "Monday",
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  assignedAdvisor: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  reviewSubmitted: {
    type: Boolean,
    default: false
  },
  city : {
    type: String,
    default: ""
  },
  district : {
    type: String,
    default: ""
  },
  cancellationTimes: {
    type: Number,
    default: 0
  },

});

eventSchema.methods.changeDate =  function (date ){
    this.date = date
    return this.save()
}
eventSchema.methods.changeStatus = function (status){
    this.status = status
    return this.save()
}
eventSchema.methods.addAssignee = async function (userId){
    if(!this.assignedUsers.includes(userId)){
        this.assignedUsers.push(userId)
        return this.save()
       }else {
        return new Error('User has already been assigned')
       }
}
eventSchema.methods.removeAssignee = async function (userId){
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
eventSchema.methods.removeFromAssigneesEvents = async function () {
  const promises = this.assignedUsers.map((userId) => {
    return User.findByIdAndUpdate(
      userId,
      { $pull: { assignedEvents: this._id } },
      { new: true }
    );
  });
  return Promise.all(promises);
}
/**Returns the Applicant name for now*/
eventSchema.methods.getApplicant = function () {
    return this.applicant
}
eventSchema.methods.addToApplicantEvents = function () {

  
  return Applicant.findById(this.applicant)
    .then(applicant => {
      if (!applicant) {
        return Promise.reject(new Error('Applicant not found'));
      }

      
      return applicant.saveEvent(this._id);
    });
}
eventSchema.methods.setWeekday = function () {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  this.weekday = daysOfWeek[this.visitDate.getDay()];
}
eventSchema.methods.takeBackAction = function () {
  if(this.status === "completed-verified"){
    this.status = "accepted"
  }else if(this.status === "canceled-verified"){
    this.status = "accepted"
  } else {
    return new Error("Event is not eligible for action")
  }
  return this.save()
}
eventSchema.methods.markVerified = function (){
  if(this.status === "completed-non-verified"){
    this.status = "completed-verified"
  }else if(this.status === "canceled-non-verified"){
    this.status = "canceled-verified"
  } else {
    return new Error("Event is not eligible for verification")
  }
  return this.save()
}
eventSchema.methods.isUserAssigned = function (userId){
  return this.assignedUsers.includes(userId)
}

eventSchema.methods.setReview = async function(reviewId) {
  try {
    this.review = reviewId;
    reviewSubmitted = true;
    return this.save();
  } catch (error) {
    throw new Error(`Failed to save review: ${error.message}`);
  }
}

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
