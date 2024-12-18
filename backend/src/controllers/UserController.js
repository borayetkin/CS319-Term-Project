const User = require("../models/User");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const Advisor = require("../models/Advisor");
const Event = require("../models/Event");
const Coordinator = require("../models/Coordinator");
const {sendNewUserEmail} = require("../config/EmailService");
const saveUser = async ({ name, email, password, role }) =>{
    // Create new user with conditional role
    const user = new User({ name, email, password, role });
    await user.save();
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
      
    );
    return token;
}
 exports.checkAuthUser = async (req,res)=>{
  const user = req.user;
  res.status(200).json(user);
  // if (user && await User.findById(user.id).select("-password")) {
  //   return res.status(200).json(user)
  // }
  
  // return res.status(401).json({ message: "Unauthorized." });
}
const changeAdvisorToUser = async (advisor) => {
  const {_id, name, email, password, role} = advisor;
  const advisorJSON = await advisor.toJSON();
  
  const user = new User({...advisorJSON,_id: advisor._id, assignedDay: "", __t : ""});

  return user;
}
const changeUserToAdvisor = async (user,assignedDay) => {
  const userJson = await user.toJSON();
  if (!assignedDay) {
    assignedDay = "Monday";
  }
  const advisor = new Advisor({...userJson,_id: user._id ,assignedDay, __t : "Advisor"});
  return advisor;
}
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      user[key] = req.body[key] || user[key];
    });
    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
deleteUserFromEvents = async (userId) => {
  const events = await Event.find();
  events.forEach(async (event) => {
    const index = event.assignedUsers.indexOf(userId);
    if (index !== -1) {
      event.participants.splice(index, 1);
      await event.save();
    }
  });
}
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and delete
    const user = await User.findByIdAndDelete(userId);
    deleteUserFromEvents(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateUserAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, role, major, assignedDay } = req.body;
    if (!["guide", "coordinator", "advisor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (role === "advisor" && !assignedDay) {
      return res.status(400).json({ message: "Assigned day must be selected for advisors." });
    }
    if (user.role !== "advisor" && role === "advisor") {

      
      const advisor = await changeUserToAdvisor(user,assignedDay);
      await User.findByIdAndDelete(userId);
      advisor.email = email || advisor.email;
      advisor.major = major || advisor.major;
      advisor.assignedDay = assignedDay || advisor.assignedDay;
      advisor.role = "advisor";
      await advisor.save();

      return res.status(200).json(advisor);
      
    } 
    if (user.role === "advisor" && role !== "advisor") {
      const newUser = await changeAdvisorToUser(user);
      newUser.email = email || newUser.email;
      if ( role === "guide") {
        newUser.major = major || newUser.major;
        
      } else{
        newUser.major = "";
      }
      newUser.role = role;
      await User.findByIdAndDelete(userId);
      await newUser.save();
      return res.status(200).json(newUser);
    }
    user.email = email || user.email;
    if (role === "advisor" || role === "guide") {
      user.major = major || user.major;
    } else{
      user.major = "";
    }
    user.role = role;
    if (role === "advisor") {
      user.assignedDay = assignedDay;
    }
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Register a new user
exports.signupUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const {sendEmail} = req.query;
  const sendEmailBool = sendEmail === 'true';
  const userToSendEmail = {name, email,password,role };
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all fields." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assign role based on criteria
    const isAdminEmail = email === "admin1@gmail.com"; // Replace with actual admin logic
    const userRole = isAdminEmail ? "admin" : role;

    // Save the new user
    let newUser;
    if (userRole === 'advisor') {

      const {assignedDay} = req.body;
      if (!assignedDay) {
        return res.status(400).json({ message: "Please provide assignedDay for advisor." });
      }
       newUser = new Advisor({...req.body, password: hashedPassword});
       await newUser.save()
    }else if(userRole === 'coordinator'){
      newUser = new Coordinator({...req.body, password: hashedPassword});
      await newUser.save()
    }
    else {
       newUser =  new User({...req.body, password: hashedPassword});
       await newUser.save()
    }
    // Generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    if (sendEmailBool) {
      await sendNewUserEmail(userToSendEmail);
    }
    res.status(201).json({ token, message: "User registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all fields." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Login successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Get the current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};

// Update the user's profile


// Get all users (admin-only functionality)
exports.getAllUsers = async (req, res) => {
  try {
    const idsParam = req.query.ids;
    if (idsParam) {
      const idsArray = idsParam.split(",");
      const users = await User.find({ _id: { $in: idsArray } }).select("-password");
      res.status(200).json(users);
    }else{
    const users = await User.find().select("-password");
    res.status(200).json(users)};
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};

exports.getAllGuides = async (req,res) => {
  try {
    const guides = await User.find({ role: "guide" }).select("-password")
                                                      .populate('assignedEvents')
                                                      .populate('completedEvents')
                                                      .populate({
                                                        path: 'reviews',
                                                        populate: [
                                                          { path: 'applicant', model: 'Applicant' } // Populate the "applicant" field inside "reviews"
                                                        ]}
                                                      );
    //console.log("Fetched guides:", guides);
    res.status(200).json(guides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch guides", error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    
    const { type, query, numOfUsers } = req.query;
    const userType = type
    if (!userType && !query && !numOfUsers) {
      return res.status(400).json({ message: "Please provide at least one search parameter." });
    }

    // Build the search criteria
    const searchCriteria = {};
    if (userType) searchCriteria.role = userType;
    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: "i" } },
        // Sonradan major eklenecek
      ];
    }

    // Find users based on criteria and limit the number of results
    const users = await User.find(searchCriteria).limit(parseInt(numOfUsers) || 0).select("-password");

    
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while searching users." });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.updateContactInfo(email, phone);
    
    const updatedUser = await User.findById(req.user.id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating contact info" });
  }
};

exports.getGuidesWithDetails = async (req, res) => {
  try {
    const guides = await User.find({ role: "guide" })
      .select("-password")
      .populate({
        path: 'assignedEvents',
        select: 'title visitDate visitTime location status applicant schoolName city studentCount'
      })
      .populate({
        path: 'completedEvents',
        select: 'title visitDate visitTime location status applicant schoolName city studentCount'
      })
      .lean();

    res.status(200).json(guides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch guides", error: err.message });
  }
};

exports.getAdvisorInfo = async (req, res) => {
  try {
    const advisors = await User.find({ role: "advisor" }).select("-password").populate('dayApplications');
    res.status(200).json(advisors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching advisors." });
  }
};
exports.updateUserFromProfile = async (req, res) => {
  try {
    const { email, phoneNumber, major, password, assignedDay } = req.body;

    
    const user = await User.findById(req.user.id );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.major = major || user.major;
    if(password){
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
    if (user.role === "advisor") {
      user.assignedDay = assignedDay || user.assignedDay;
    }
    await user.save();

    
    res.status(200).json(user);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
}
