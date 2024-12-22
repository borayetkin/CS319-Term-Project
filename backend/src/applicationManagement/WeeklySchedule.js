const mongoose = require("mongoose");

const weeklyScheduleSchema = new mongoose.Schema({
  weekBeginning: {
    type: Date,
    required: true,
  },
  weekEnding: {
    type: Date,
    required: true,
  },
  
  slots: [
    {
      slotDay: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
      },
      slotTime: {
        type: String,
        required: true,
      },
      events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      }],
      availableEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      }],
      isEmpty: {
        type: Boolean,
        default: true,
      },
      isFull: {
        type: Boolean,
        default: false
      }
    },
  ],
});

const WeeklySchedule = mongoose.model("WeeklySchedule", weeklyScheduleSchema);
module.exports = WeeklySchedule;
