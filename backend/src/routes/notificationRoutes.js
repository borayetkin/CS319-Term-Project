const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const auth = require('../middleware/authMiddleware');

router.get('/guide', auth, notificationController.getGuideNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.patch('/:id/read', auth, notificationController.markAsRead);
router.post('/debug', auth, notificationController.sendDebugNotification);

module.exports = router; 