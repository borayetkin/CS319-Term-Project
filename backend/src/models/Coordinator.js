const mongoose = require("mongoose");
const User = require("./User");
const Event = require("./Event");


const coordinatorSchema = new mongoose.Schema({

});

coordinatorSchema.methods.notifyGuidesAboutFait = function (eventId) {
    // To be implemented
}
coordinatorSchema.methods.acceptGuideToFair = function (eventID) {
    // To be implemented 
}

Object.assign(coordinatorSchema.methods, User.schema.methods);

const Advisor = User.discriminator("Coordinator", coordinatorSchema);
module.exports = Advisor;
