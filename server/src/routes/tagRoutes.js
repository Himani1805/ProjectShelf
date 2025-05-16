const express = require('express');
const {
    createTag,
    getTags,
    getPopularTags,
    updateTag,
    deleteTag,
    getProjectsByTag
} = require('../controllers/tagController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router
    .route('/')
    .get(getTags)
    .post(protect, authorize('admin'), createTag);

router.get('/popular', getPopularTags);

router
    .route('/:id')
    .put(protect, authorize('admin'), updateTag)
    .delete(protect, authorize('admin'), deleteTag);

router.get('/:id/projects', getProjectsByTag);

module.exports = router;