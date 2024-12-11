const Fair = require("../models/Fair");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendNotification } = require("./NotificationController");

// Create a new fair
exports.createFair = async (req, res) => {
  try {
    const {
      organiserName,
      schoolName,
      email,
      phoneNumber,
      location,
      fairDate,
      fairTime,
      city,
      additionalNotes = "",
      requiredNumberOfGuides = 2,
      status = "pending",
      hoursOfWork = 3,
    } = req.body;

    // Validate the date
    const parsedDate = new Date(fairDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const fair = new Fair({
      organiserName,
      schoolName,
      email,
      phoneNumber,
      location,
      fairDate: parsedDate,
      fairTime,
      city,
      additionalNotes,
      requiredNumberOfGuides,
      status,
      hoursOfWork,
    });

    await fair.save();

    res.status(201).json({
      message: "Fair created successfully",
      fair,
    });
  } catch (error) {
    console.error("Error creating fair:", error);
    res.status(500).json({ message: "Failed to create fair", error: error.message });
  }
};

// Get all fairs
exports.getFairs = async (req, res) => {
  try {
    const fairs = await Fair.find()
      .populate('assignedUsers', 'name') // Populate the guide's name
      .exec();
    res.status(200).json(fairs);
  } catch (error) {
    console.error("Error fetching fairs:", error);
    res.status(500).json({ message: "Failed to fetch fairs", error: error.message });
  }
};

exports.getAcceptedFairs = async (req, res) => {
  try {
    const acceptedFairs = await Fair.find({ status: "accepted" })
      .populate('assignedUsers', 'name') // Populate the guide's name
      .exec();

    if (acceptedFairs.length === 0) {
      return res.status(404).json({ message: "No accepted fairs found." });
    }

    res.status(200).json(acceptedFairs);
  } catch (error) {
    console.error("Error fetching accepted fairs:", error);
    res.status(500).json({ message: "Failed to fetch accepted fairs", error: error.message });
  }
};

// Get a specific fair by ID
exports.getFair = async (req, res) => {
  try {
    const { id } = req.params;
    const fair = await Fair.findById(id)
          .populate('assignedUsers', 'name') // Populate the guide's name
          .exec();
    if (!fair) {
      return res.status(404).json({ message: "Fair not found" });
    }
    res.status(200).json(fair);
  } catch (error) {
    console.error("Error fetching fair:", error);
    res.status(500).json({ message: "Failed to fetch fair", error: error.message });
  }
};

// Update fair status
exports.updateFairStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const fair = await Fair.findById(id);
    if (!fair) {
      return res.status(404).json({ message: "Fair not found" });
    }

    // Update status directly
    fair.status = status;
    await fair.save();

    if (status === 'accepted') {
      // Get all guides
      const guides = await User.find({ role: 'guide' });

      // Create notifications for all guides
      const notifications = guides.map(guide => ({
        recipient: guide._id,
        title: "New Fair Available",
        message: `A new fair has been confirmed at ${fair.schoolName} on ${new Date(fair.fairDate).toLocaleDateString()} at ${fair.fairTime}`,
        read: false
      }));

      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      message: "Fair status updated successfully",
      fair,
    });
  } catch (error) {
    console.error("Error updating fair status:", error);
    res.status(500).json({ message: "Failed to update fair status", error: error.message });
  }
};

// Assign guide to a fair
exports.assignGuideToFair = async (req, res) => {
  try {
    const { id: fairID } = req.params;
    const { userID } = req.body;

    const fair = await Fair.findById(fairID);
    if (!fair) {
      return res.status(404).json({ message: "Fair not found" });
    }

    const guide = await User.findById(userID);
    if (!guide) {
      return res.status(400).json({ message: "Invalid guide ID" });
    }

    if (fair.assignedUsers.includes(userID)) {
      return res.status(400).json({ message: "Guide already assigned." });
    }

    if (fair.assignedUsers.length >= fair.requiredNumberOfGuides) {
      return res.status(400).json({ message: "Required number of guides already assigned." });
    }

    fair.assignedUsers.push(userID);
    await fair.save();

    try {
      await guide.addAssignedFair(fairID);
      await guide.save();
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Failed to assign guide", error: error.message });
    }
    const notifactionProps = {
      recipient: userID,
      title: "New Fair Assigned",
      message: `You have been assigned to a new fair at ${fair.schoolName} on ${new Date(fair.fairDate).toLocaleDateString()} at ${fair.fairTime}`,
      read: false
    }
    
    try {
      sendNotification(notifactionProps)
    } catch (error) {
      
      return res.status(400).json({ message: "Failed to send notification", error: error.message });
    }
    res.status(200).json({ message: "Guide assigned successfully.", fair });
  } catch (error) {
    console.error("Error assigning guide:", error);
    res.status(500).json({ message: "Failed to assign guide", error: error.message });
  }
};

// Remove guide from a fair
exports.removeGuideFromFair = async (req, res) => {
  try {
    console.log("Request received to remove guide from fair.");
    console.log("Fair ID:", req.params.id);
    console.log("User ID from body:", req.body.userID);

    const { id: fairID } = req.params;
    const { userID } = req.body;

    const fair = await Fair.findById(fairID);
    console.log("Fair fetched:", fair);

    if (!fair) {
      console.log("Fair not found with ID:", fairID);
      return res.status(404).json({ message: "Fair not found" });
    }

    if (!fair.assignedUsers.includes(userID)) {
      console.log(`User ID ${userID} is not assigned to the fair.`);
      return res.status(400).json({ message: "Guide is not assigned to this fair." });
    }

    fair.assignedUsers = fair.assignedUsers.filter(
      assignedUserID => assignedUserID.toString() !== userID
    );
    console.log("Updated assignedUsers list:", fair.assignedUsers);

    const guide = await User.findById(userID);
    console.log("Guide fetched:", guide);
    if (!guide) {
      console.log("Guide not found with ID:", userID);
      return res.status(404).json({ message: "Guide not found" });
    }
    await guide.removeAssignedFair(fairID);
    console.log(`Fair ID ${fairID} removed from guide's assigned fairs.`);

    await fair.save();
    await guide.save();
    const notifactionProps = {
      recipient: userID,
      title: "Removed From Fair",
      message: `You have been removed from a fair at ${fair.schoolName} on ${new Date(fair.fairDate).toLocaleDateString()} at ${fair.fairTime}`,
      read: false
    }
    try {
      sendNotification(notifactionProps)
    } catch (error) {
      
      return res.status(400).json({ message: "Failed to send notification", error: error.message });
    }
    res.status(200).json({ message: "Guide removed successfully.", fair });
  } catch (error) {
    console.error("Error removing guide:", error);
    res.status(500).json({ message: "Failed to remove guide", error: error.message });
  }
};

// Delete a fair
exports.deleteFair = async (req, res) => {
  try {
    const { id } = req.params;

    const fair = await Fair.findByIdAndDelete(id);
    if (!fair) {
      return res.status(404).json({ message: "Fair not found" });
    }
    const recipients = fair.assignedUsers;
    for (let i = 0; i < recipients.length; i++) {
      const notifactionProps = {
        recipient: recipients[i],
        title: "Fair Deleted",
        message: `A fair you were assigned to has been deleted : ${fair.schoolName} on ${new Date(fair.fairDate).toLocaleDateString()} at ${fair.fairTime}`,
        read: false
      }
      try {
        sendNotification(notifactionProps)
      } catch (error) {
        
        return res.status(400).json({ message: "Failed to send notification", error: error.message });
      }
    }
    res.status(200).json({
      message: "Fair deleted successfully",
      fair,
    });
  } catch (error) {
    console.error("Error deleting fair:", error);
    res.status(500).json({ message: "Failed to delete fair", error: error.message });
  }
};

exports.applyToFair = async (req, res) => {
  try {
    const { fairID } = req.body; // Fair ID from the request body
    const { userrole, userid } = req.headers; // User role and ID from headers

    // Ensure only guides can apply
    if (userrole !== "guide") {
      return res.status(403).json({ message: "Only guides can apply to fairs." });
    }

    // Find the guide (user)
    const user = await User.findById(userid || req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the fair
    const fair = await Fair.findById(fairID);
    if (!fair) {
      return res.status(404).json({ message: "Fair not found" });
    }

    // Check if the guide has already applied
    if (fair.appliedUsers.includes(userid)) {
      return res
        .status(400)
        .json({ message: "You have already applied to this fair." });
    }

    // Add the guide to the list of applied users
    fair.appliedUsers.push(userid);

    await fair.save();

    res.status(200).json({ message: "Applied to fair successfully" });
  } catch (error) {
    console.error("Error applying to fair:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


