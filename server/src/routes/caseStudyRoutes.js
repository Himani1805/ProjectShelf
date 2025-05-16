const express = require('express');
const {
    getCaseStudies,
    getCaseStudy,
    createCaseStudy,
    updateCaseStudy,
    deleteCaseStudy
} = require('../controllers/caseStudyController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router
    .route('/')
    .get(getCaseStudies)
    .post(protect, createCaseStudy);

router
    .route('/:id')
    .get(getCaseStudy)
    .put(protect, updateCaseStudy)
    .delete(protect, deleteCaseStudy);

module.exports = router;