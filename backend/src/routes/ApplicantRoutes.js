const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/ApplicantController');
const auth = require('../middleware/authMiddleware');

// Route to create a new applicant
router.post('/', applicantController.createApplicant);


// Route to get all applicants
router.get('/', auth, applicantController.getAllApplicants);

// Route to get an applicant by ID
router.get('/:id', auth, applicantController.getApplicantById);

// Route to update an applicant by ID
router.put('/:id', auth, applicantController.updateApplicant);

// Route to delete an applicant by ID
router.delete('/:id', auth, applicantController.deleteApplicant);

module.exports = router;