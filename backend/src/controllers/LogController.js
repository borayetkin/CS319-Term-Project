const Log = require("../models/Log");
const User = require("../models/User");

exports.createLog = async (userId, role, action, targetId, status, comment) => {
  try {
    if (status === "error") return;
    if (!userId || !role || !action || !targetId || !status || !comment) {
      console.error("Missing required fields for log creation");
      return;
    }
    const user = await User.findById(userId);
    const newComment = `${comment} by ${user.role} ${user.name}`;
    const log = new Log({
      userId,
      role,
      action,
      targetId,
      details: { status, newComment },
      timestamp: new Date()
    });
    await log.save();
  } catch (error) {
    console.error("Error creating log:", error.message);
  }
};


exports.getLogs = async (req, res) => {
    try {
        const { action } = req.query;
        const filter = action ? { action } : {};
        const logs = await Log.find(filter).populate("userId").populate("targetId").sort({ timestamp: -1 });
        console.log(logs);
        res.status(200).send(logs);
    } catch (error) {
        console.error("Error fetching logs:", error.message);
        res.status(500).send("Server error");
    }
};

