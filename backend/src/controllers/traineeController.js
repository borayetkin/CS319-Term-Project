const Trainee = require('../models/Trainee');

// Create a new trainee
exports.createTrainee = async (req, res) => {
  try {
    const { name, phoneNumber, email, schoolID, department } = req.body;

    // Check if a trainee with the same school ID already exists
    const existingTrainee = await Trainee.findOne({ schoolID });
    if (existingTrainee) {
      return res.status(400).send({ error: 'Trainee with this school ID already exists.' });
    }

    const trainee = new Trainee({
      name,
      phoneNumber,
      email,
      schoolID,
      department,
      currentTraineeship: {
        status: "pending",
        applicationDate: Date.now(),
      },
      traineeships: [],
    });
    await trainee.save();
    res.status(201).send(trainee);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Get all trainees
exports.getAllTrainees = async (req, res) => {
  try {
    const trainees = await Trainee.find();
    res.send(trainees);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
exports.getTraineeById = async (req, res) => {
  try {
    const trainee = await Trainee.findById(req.params.id);
    if (!trainee) {
      return res.status(404).send();
    }
    res.send(trainee);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get trainee applications
exports.getTraineeApplications = async (req, res) => {

  try {
    const trainees = await Trainee.find();
    
    res.send(trainees);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

// Get accepted trainees
exports.getAcceptedTrainees = async (req, res) => {

  try {
    const trainees = await Trainee.find({ 'currentTraineeship.status': 'interview-accepted' });
    res.send(trainees);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};
exports.acceptTraineeApplication = async (req, res) => {
    try {
        const trainee = await Trainee.findById(req.params.id);
        if (!trainee) {
        return res.status(404).send({ error: 'Trainee not found' });
        }
    
        trainee.currentTraineeship.status = 'interview-accepted';
        await trainee.save();
        res.send(trainee);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
    }
// Assign interview date
exports.assignInterviewDate = async (req, res) => {
  try {
    const { interviewDate } = req.body;
    const trainee = await Trainee.findById(req.params.id);
    if (!trainee) {
      return res.status(404).send({ error: 'Trainee not found' });
    }

    trainee.currentTraineeship.status = 'interview-pending';
    trainee.currentTraineeship.interviewDate = new Date(interviewDate);
    await trainee.save();
    res.send(trainee);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Update a trainee
exports.updateTrainee = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phoneNumber', 'email', 'currentTraineeship', 'department', 'schoolID'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const trainee = await Trainee.findById(req.params.id);
    if (!trainee) {
      return res.status(404).send();
    }

    updates.forEach((update) => (trainee[update] = req.body[update]));
    await trainee.save();
    res.send(trainee);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Delete a trainee
exports.deleteTrainee = async (req, res) => {
  try {
    const trainee = await Trainee.findByIdAndDelete(req.params.id);
    if (!trainee) {
      return res.status(404).send();
    }
    res.send(trainee);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
