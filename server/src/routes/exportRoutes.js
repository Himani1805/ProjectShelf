const express = require('express');
const {
    exportProjects,
    exportAnalytics,
    exportCaseStudies
} = require('../controllers/exportController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All export routes require authentication
router.use(protect);

router.get('/projects', exportProjects);
router.get('/analytics', exportAnalytics);
router.get('/case-studies', exportCaseStudies);

module.exports = router;