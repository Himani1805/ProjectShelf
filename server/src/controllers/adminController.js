const User = require('../models/userModel');
const Project = require('../models/projectModel');
const CaseStudy = require('../models/caseStudyModel');
const Comment = require('../models/commentModel');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();
        const projectCount = await Project.countDocuments();
        const caseStudyCount = await CaseStudy.countDocuments();
        const commentCount = await Comment.countDocuments();

        // Get recent users
        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(5)
            .select('name email role createdAt');

        // Get recent projects
        const recentProjects = await Project.find()
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'name email')
            .select('title createdAt');

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    users: userCount,
                    projects: projectCount,
                    caseStudies: caseStudyCount,
                    comments: commentCount
                },
                recentUsers,
                recentProjects
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        // Validate role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with id of ${req.params.id}`
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with id of ${req.params.id}`
            });
        }

        // Don't allow admin to delete themselves
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await user.deleteOne();

        // Delete user's projects, case studies, and comments
        await Project.deleteMany({ user: req.params.id });
        await CaseStudy.deleteMany({ user: req.params.id });
        await Comment.deleteMany({ user: req.params.id });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reported content
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getReportedContent = async (req, res, next) => {
    try {
        // This would require a Report model, which we'll implement later
        res.status(200).json({
            success: true,
            data: []
        });
    } catch (error) {
        next(error);
    }
};