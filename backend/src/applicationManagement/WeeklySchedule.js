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
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: false,
      },
      isEmpty: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

const WeeklySchedule = mongoose.model("WeeklySchedule", weeklyScheduleSchema);
module.exports = WeeklySchedule;
