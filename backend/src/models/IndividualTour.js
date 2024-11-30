const { default: mongoose } = require('mongoose');
const Event = require('./Event');

const individualTourSchema = new mongoose.Schema({
    rating: {
        type: Number,
        default: 0
    },
    studentName: {
        type: String,
        required: true
    },
    studentHighSchool: {
        type: String,
        required: true,
    },
    majorOfInterest: {
        type: String,
        required: true,
    },
    
});

individualTourSchema.methods.setStudentHighSchool = function (studentHighSchool){
    this.studentHighSchool = studentHighSchool
    return this.save()
}

individualTourSchema.methods.setRating = function (rating){
    this.rating = rating
    return this.save()
}
individualTourSchema.methods.setAssignedAdvisor = function (advisorId){
    try {
        this.assignedUsers[0] = advisorId
        return this.save()
    } catch (error) {
        return Promise.reject(new Error("Server Error"))
    }
}


const IndividualTour = Event.discriminator("IndividualTour", individualTourSchema);
Object.assign(individualTourSchema.methods, Event.schema.methods);

module.exports = IndividualTour;
  