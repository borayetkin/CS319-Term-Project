const express = require('express');
const traineeController = require('../controllers/traineeController');
const router = express.Router();
const advisorAuth = require('../middleware/advisorMiddleware');
router.get('/trainees', advisorAuth,traineeController.getTraineeApplications);

// Create a new trainee
router.post('/trainees', traineeController.createTrainee);

// Update a trainee
router.post('/trainees/:id', advisorAuth,traineeController.updateTrainee);

// Delete a trainee
router.post('/trainees/:id/assign-interview', advisorAuth, traineeController.assignInterviewDate);
router.delete('/trainees/:id', advisorAuth,traineeController.deleteTrainee);
router.get('/trainees/:id', advisorAuth,traineeController.getTraineeById);

// Get trainee applications
router.get('/trainees-applications',advisorAuth, traineeController.getTraineeApplications);

// Get accepted trainees
router.get('/trainees-accepted', advisorAuth, traineeController.getAcceptedTrainees);

// Assign interview date

module.exports = router;