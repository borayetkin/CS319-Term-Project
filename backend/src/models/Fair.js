const { default: mongoose } = require('mongoose');
const Event = require('./Event');

const fairSchema = new mongoose.Schema({
    schoolName: {
        type : String,
        required : true
    },
    location : {
        type: String,
        required : true
    },
    fairTime: {
        type: String,
        required: true,
    },
    additionalNotes: {
        type: String,
        default: "",
    },
    hoursOfWork: {
        type: Number,
        default: 3,
    },

  });

fairSchema.methods.setLocation = function (location) {
    this.location = location
    return this.save()
}

fairSchema.methods.setFairTime = function (fairTime) {
  this.fairTime = fairTime;
  return this.save();
};

fairSchema.methods.setStatus = function (status) {
  if (["pending", "approved", "rejected", "completed"].includes(status)) {
    this.status = status;
    return this.save();
  }
  return Promise.reject(new Error("Invalid status"));
};

fairSchema.methods.setAssignedAdvisor = function (advisorId) {
  try {
    this.assignedUsers[0] = advisorId;
    return this.save();
  } catch (error) {
    return Promise.reject(new Error("Server Error"));
  }
};




const Fair = Event.discriminator("Fair", fairSchema);
Object.assign(fairSchema.methods, Event.schema.methods);

module.exports = Fair;
