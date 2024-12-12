const mongoose = require("mongoose");

const eventSlotSchema = new mongoose.Schema({
  slotDay: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true,
  },
  slotTime: {
    type: String,
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: false,
  },
  isEmpty: {
    type: Boolean,
    default: true
  },
});

module.exports = mongoose.model("EventSlot", eventSlotSchema);