const mongoose = require("mongoose");
const Event = require("../models/Event");

const User = require("../models/User");
const SchoolTour = require("../models/SchoolTour");
const IndividualTour = require("../models/IndividualTour");
const Fair = require("../models/Fair");

module.exports.createSchoolTour = ({
  visitDate,
  studentCount,
  additionalNotes = "",
  hoursOfWork = 3,
  requiredNumberOfGuides = 1,
  status = "pending",
}) => {
  let tour = new SchoolTour({
    visitDate: visitDate,
    studentCount: studentCount,
    additionalNotes: additionalNotes,
    hoursOfWork: hoursOfWork,
    requiredNumberOfGuides: requiredNumberOfGuides,
    status: status,
  });
  return tour.save();
};
module.exports.createIndividualTour = ({
  visitDate,
  studentHighChool,
  additionalNotes = "",
  hoursOfWork = 3,
  requiredNumberOfGuides = 1,
  status = "pending",
}) => {
  let tour = new IndividualTour({
    visitDate: visitDate,
    studentHighChool: studentHighChool,
    additionalNotes: additionalNotes,
    hoursOfWork: hoursOfWork,
    requiredNumberOfGuides: requiredNumberOfGuides,
    status: status,
  });
  return tour.save();
};
module.exports.createFair = ({
  visitDate,
  location,
  additionalNotes = "",
  hoursOfWork = 3,
  requiredNumberOfGuides = 1,
  status = "pending",
}) => {
  let fair = new Fair({
    visitDate: visitDate,
    location: location,
    additionalNotes: additionalNotes,
    hoursOfWork: hoursOfWork,
    requiredNumberOfGuides: requiredNumberOfGuides,
    status: status,
  });
  return fair.save();
};
module.exports.destroyEvent = async (id) => {
  try {
    await Event.findById(id);
  } catch (error) {
    return Promise.reject(new Error("Id not found"));
  }
  try {
    return Event.findByIdAndDelete(id);
  } catch (error) {
    return Promise.reject(new Error("Server Error"));
  }
};
module.exports.getEvent = (id) => {
  try {
    return Event.findById(id);
  } catch (error) {
    return Promise.reject(new Error("Event not found"));
  }
};
module.exports.getAllEvents = () => {
  return Event.find();
};
module.exports.updateEvent = (eventId, eventProp) => {
  return Event.findByIdAndUpdate(eventId, eventProp);
};
module.exports.asignAdvisorToTour = async (advisorID, eventID) => {
  let event;
  let advisor;
  try {
    event = await Event.findById(eventID);
  } catch (error) {
    return Promise.reject(new Error("Event Not Found"));
  }
  try {
    advisor = await User.findById(eventID);
  } catch (error) {
    return Promise.reject(new Error("User Not Found"));
  }
  try {
    if (
      advisor.role === "advisor" ||
      advisor.role === "coordinator" ||
      advisor.role === "admin"
    ) {
      return event.setAssignedAdvisor(advisorID);
    } else {
      return Promise.reject(new Error("User is not an advisor or above"));
    }
  } catch (error) {
    return Promise.reject(new Error("Server Error"));
  }
};

module.exports.notifyCoordinatorAboutFair = (fairID) =>{
    let fair;
    // To Be Implemented
}
