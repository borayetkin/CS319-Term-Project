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
      details: { status, comment :newComment },
      timestamp: new Date()
    });
    await log.save();
  } catch (error) {
    console.error("Error creating log:", error.message);
  }
};


exports.getLogs = async (req, res) => {
    try {
      // set maximum to 5000
        const { action, limit } = req.query;
        let filter = action ? { action } : {};
        let logs;
        if( limit && limit === 'true'){ 
        logs = await Log.find(filter).limit(50000).populate("userId").sort({ timestamp: -1 });}
        else{
        logs = await Log.find(filter).populate("userId").sort({ timestamp: -1 });
        }
        console.log(logs[0]);
        res.status(200).send(logs);
    } catch (error) {
        console.error("Error fetching logs:", error.message);
        res.status(500).send("Server error");
    }
};

exports.getLog = async (req, res) => {
    try {
        const log = await Log.findById(req.params.id).populate("userId").populate("targetId");
        if (!log) {
            return res.status(404).send("Log not found");
        }
        res.status(200).send(log);
    } catch (error) {
        console.error("Error fetching log:", error.message);
        res.status(500).send("Server error");
    }
}