const { default: mongoose } = require('mongoose');
const Event = require('./Event');

const schoolTourSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    visitDate: {
        type: Date,
        required: true
    },
    visitTime: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    studentCount: {
        type: Number,
        required: true
    },
    additionalNotes: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: true
    }
});

schoolTourSchema.methods.setAssignedAdvisor = function (advisorId){
    try {
        this.assignedAdvisor = advisorId
        return this.save()
    } catch (error) {
        return Promise.reject(new Error("Server Error"))
    }
}

schoolTourSchema.methods.setRating = function (rating){
    this.rating = rating
    return this.save()
}
const SchoolTour = Event.discriminator("SchoolTour", schoolTourSchema);
module.exports = SchoolTour;
  