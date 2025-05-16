const express = require('express');
const {
    getDashboardStats,
    getUsers,
    updateUserRole,
    deleteUser,
    getReportedContent
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply admin authorization to all routes
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReportedContent);

module.exports = router;