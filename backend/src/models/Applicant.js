const mongoose = require("mongoose");
const User = require('./User');
const  Event  = require("./Event");
const applicantSchema = new mongoose.Schema({
  name :{
    type: String,
    required: true
  },
  phoneNumber :{
    type: String,
    required: true
  },
  typeOfApplicant :{
    type: String
  },
  email :{
    type: String,
    required: true
  },
  events :
   [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}]
  ,
  priority :
  {
    type: String,
    default: "General"
  },
  schoolID :{
    type: Number,
    default: -1
  }
});
applicantSchema.methods.saveEvent = async function(eventId) {
  try {
    this.events.push(eventId);
    return this.save();
  } catch (error) {
    throw new Error(`Failed to save event: ${error.message}`);
  }
};

const Applicant = mongoose.model("Applicant", applicantSchema);
module.exports = Applicant;
