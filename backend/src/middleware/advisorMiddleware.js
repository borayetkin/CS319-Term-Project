const jwt = require("jsonwebtoken");
const User = require("../models/User");

const advisorAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || (user.role !== "admin" && user.role !== "coordinator" && user.role !== "advisor")) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin or Coordinator only." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = advisorAuth;
