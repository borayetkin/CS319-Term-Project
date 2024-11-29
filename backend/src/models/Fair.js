const { default: mongoose } = require('mongoose');
const Event = require('./Event');

const fairSchema = new mongoose.Schema({
    schoolName: {
        type : String,
        required : true
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
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending"
    }
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





const Fair = Event.discriminator("Fair", fairSchema);
Object.assign(fairSchema.methods, Event.schema.methods);

module.exports = Fair;
