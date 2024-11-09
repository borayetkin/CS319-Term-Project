const { default: mongoose } = require('mongoose');
const Event = require('./Event');

const schoolTourSchema = new mongoose.Schema({
    rating : {
        type: Number,
        default: 0
      },
    
        assignedAdvisor :{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        },
        studentCount: {
          type: Number,
          required : true
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
  