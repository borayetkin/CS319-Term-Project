const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getGuideNotifications = async (req, res) => {
  try {
    console.log("User making request:", req.user);
    console.log("User ID:", req.user._id);
    
    const notifications = await Notification.find({ 
      recipient: req.user._id 
    }).sort({ createdAt: -1 });
    
    console.log("Found notifications for user:", notifications.length);
    console.log("Notifications:", notifications);
    
    res.json(notifications);
  } catch (error) {
    console.error("Error in getGuideNotifications:", error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching unread count" });
  }
};

exports.sendDebugNotification = async (req, res) => {
  try {
    console.log("Starting debug notification process");
    
    // Find all guides
    const guides = await User.find({ role: 'guide' });
    console.log("Found guides:", guides.length);
    
    if (guides.length === 0) {
      console.log("No guides found in the system");
      return res.status(400).json({ message: "No guides found in the system" });
    }
    
    // Create a notification for each guide
    const notifications = guides.map(guide => ({
      recipient: guide._id,
      title: req.body.title || "Debug Notification",
      message: req.body.message || "This is a test notification",
      read: false
    }));

    console.log("Creating notifications:", notifications);
    
    // Save the notifications
    const savedNotifications = await Notification.insertMany(notifications);
    console.log("Saved notifications:", savedNotifications);
    
    res.json({ 
      message: "Debug notifications sent successfully", 
      count: guides.length,
      notifications: savedNotifications 
    });
  } catch (error) {
    console.error("Error in sendDebugNotification:", error);
    res.status(500).json({ message: "Error sending notifications", error: error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const allNotifications = await Notification.find({});
    res.json({
      total: allNotifications.length,
      notifications: allNotifications
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all notifications" });
  }
}; 