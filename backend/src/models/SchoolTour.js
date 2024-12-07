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
    },
      

});

schoolTourSchema.methods.setAssignedAdvisor = function (advisorId){
    this.assignedAdvisor = advisorId
}
schoolTourSchema.methods.setRequiredNumberOfGuides = function (){

    this.requiredNumberOfGuides = parseInt(((this.studentCount / 60)+1),10);
    
}

schoolTourSchema.methods.setRating = function (rating){
    this.rating = rating
    return this.save()
}

const SchoolTour = Event.discriminator("SchoolTour", schoolTourSchema);
Object.assign(schoolTourSchema.methods, Event.schema.methods);
module.exports = SchoolTour;
  