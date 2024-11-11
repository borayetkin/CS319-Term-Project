const express = require('express');
const router = express.Router();
const eventController = require('../controllers/EventController');

// School tour routes now point to EventController
router.post('/schooltours', eventController.createSchoolTour);

// Other event routes
router.post('/individualtours', eventController.createIndividualTour);
router.post('/fairs', eventController.createFair);
router.get('/:id', eventController.getEvent);
router.get('/', eventController.getAllEvents);
router.put('/:eventId', eventController.updateEvent);
router.delete('/:id', eventController.destroyEvent);
router.post('/assign-advisor', eventController.asignAdvisorToTour);
router.delete('/events/:eventId', eventController.deleteEvent);

module.exports = router;
