const express = require('express');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getRecentNotifications // Added
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/recent', protect, getRecentNotifications); // Added
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;