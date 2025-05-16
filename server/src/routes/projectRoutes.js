const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getRecentProjects,
    togglePublishStatus
} = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router
    .route('/')
    .get(protect, getProjects) // Changed to protect to get user-specific projects
    .post(protect, createProject);

router.get('/recent', protect, getRecentProjects);

router
    .route('/:id')
    .get(getProject)
    .put(protect,authorize('creator'), updateProject)
    .delete(protect,authorize('creator'), deleteProject);

// Toggle publish status route
router.put('/:id/publish', protect, togglePublishStatus);

module.exports = router;