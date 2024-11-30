const mongoose = require("mongoose");
const User = require('./User');
const Applicant = require('./Applicant');
const eventSchema = new mongoose.Schema({
  applicant: {
    applicantID : {type: mongoose.Schema.Types.ObjectId, ref: 'Applicant'},
    name:{
      type: String,
      required: true,
    }
// For now, will be updated with a new applicant class
  },
  visitDate : {
    type: Date,
    required : true
  },
  visitTime : {
    type: String,
    required : true
  },
  assignedUsers: [{
    type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], default: []
  }],
  requiredNumberOfGuides : {
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
  },
    weekday : {
        type : String,
        default: "Monday",
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
    ,
    assignedAdvisor: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}

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

  
  return Applicant.findById(this.applicant.applicantID)
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
const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
