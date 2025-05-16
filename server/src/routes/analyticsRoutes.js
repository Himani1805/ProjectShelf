const express = require('express');
const {
    recordView,
    recordClick,
    recordEngagement,
    getUserAnalytics,
    getDashboardAnalytics, // Added
    getContentAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Public routes for recording analytics
router.post('/view', recordView);
router.post('/click', recordClick);
router.post('/engagement', recordEngagement);

// Private routes for viewing analytics
router.get('/dashboard', protect, getDashboardAnalytics); // Added
router.get('/user', protect, getUserAnalytics);
router.get('/:refType/:refId', protect, getContentAnalytics);

module.exports = router;