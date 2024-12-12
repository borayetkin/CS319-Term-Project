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
  slots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventSlot',
    required: true
  }],
});

module.exports = mongoose.model("WeeklySchedule", weeklyScheduleSchema);