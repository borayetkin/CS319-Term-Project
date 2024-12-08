const Fair = require("../models/Fair");
const User = require("../models/User");
const Notification = require("../models/Notification");

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
    const acceptedFairs = await Fair.find({ status: "accepted" });

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
    const fair = await Fair.findById(id);
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
      await guide.addAssignedEvent(fairID);
      await guide.save();
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Failed to assign guide", error: error.message });
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
    const { id: fairID } = req.params;
    const { userID } = req.body;

    const fair = await Fair.findById(fairID);
    if (!fair) {
      return res.status(404).json({ message: "Fair not found" });
    }

    if (!fair.assignedUsers.includes(userID)) {
      return res.status(400).json({ message: "Guide is not assigned to this fair." });
    }

    fair.assignedUsers = fair.assignedUsers.filter(
      assignedUserID => assignedUserID.toString() !== userID
    );
    await guide.removeAssignedEvent(fairID);
    await fair.save();
    await guide.save();

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

    res.status(200).json({
      message: "Fair deleted successfully",
      fair,
    });
  } catch (error) {
    console.error("Error deleting fair:", error);
    res.status(500).json({ message: "Failed to delete fair", error: error.message });
  }
};


