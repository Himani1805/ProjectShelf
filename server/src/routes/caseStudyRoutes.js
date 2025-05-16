const express = require('express');
const {
    getCaseStudies,
    getCaseStudy,
    createCaseStudy,
    updateCaseStudy,
    deleteCaseStudy
} = require('../controllers/caseStudyController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router
    .route('/')
    .get(getCaseStudies)
    .post(protect, createCaseStudy);

router
    .route('/:id')
    .get(getCaseStudy)
    .put(protect,authorize('creator'), updateCaseStudy)
    .delete(protect,authorize('creator'), deleteCaseStudy);

module.exports = router;