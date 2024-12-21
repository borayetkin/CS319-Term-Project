const { default: mongoose } = require('mongoose');
const User = require('./User');

const fairSchema = new mongoose.Schema({
    organiserName: {
        type: String,
        required: true
    },
    schoolName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    location : {
        type: String,
        required : true
    },
    fairDate: {
         type: Date,
         required: true,
    },
    fairTime: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true
    },
    additionalNotes: {
        type: String,
        default: "",
    },
    requiredNumberOfGuides : {
      type: Number,
      default : 2
    },
    status : {
      type: String,
      enum : ["pending", "accepted", "rejected", "completed" ,"canceled"],
      default: "pending"
    },
    hoursOfWork : {
      type : Number,
      default : 3
    },
    assignedUsers: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []
    }],
    appliedUsers: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []
    }],

  });

fairSchema.methods.setLocation = function (location) {
    this.location = location
    return this.save()
}

fairSchema.methods.changeDate =  function (date ){
    this.date = date
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

const Fair = mongoose.model("Fair", fairSchema);

module.exports = Fair;
