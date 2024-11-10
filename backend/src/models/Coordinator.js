const mongoose = require("mongoose");
const User = require("./User");
const Event = require("./Event");
const { updateUserRole } = require("../controllers/adminController");

const coordinatorSchema = new mongoose.Schema({

});

coordinatorSchema.methods.notifyGuidesAboutFait = function (eventId) {
    // To be implemented
}
coordinatorSchema.methods.acceptGuideToFair = function (eventID) {
    // To be implemented 
}

coordinatorSchema.methods.updateUserRole = updateUserRole


const Advisor = User.discriminator("Coordinator", coordinatorSchema);
module.exports = Advisor;
