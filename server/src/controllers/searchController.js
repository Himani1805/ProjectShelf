const Project = require('../models/projectModel');
const CaseStudy = require('../models/caseStudyModel');
const User = require('../models/userModel');

// @desc    Search across projects, case studies, and users
// @route   GET /api/search
// @access  Public
exports.search = async (req, res, next) => {
    try {
        const { query, type, technologies, sort } = req.query;

        // Base search conditions
        const searchCondition = query
            ? {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            }
            : {};

        // Add technology filter if provided
        if (technologies) {
            const techArray = technologies.split(',');
            searchCondition.technologies = { $in: techArray };
        }

        // Determine sort order
        const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

        let results = {};

        // Search in specific type or all if not specified
        if (!type || type === 'project') {
            results.projects = await Project.find(searchCondition)
                .sort(sortOrder)
                .populate('user', 'name email');
        }

        if (!type || type === 'casestudy') {
            results.caseStudies = await CaseStudy.find(searchCondition)
                .sort(sortOrder)
                .populate('user', 'name email')
                .populate('project', 'title');
        }

        if (!type || type === 'user') {
            results.users = await User.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            }).select('-password');
        }

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        next(error);
    }
};