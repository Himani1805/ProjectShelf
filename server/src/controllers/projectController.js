const Project = require('../models/projectModel');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const Tag = require('../models/tagModel');

exports.createProject = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        // Ensure published field is a boolean
        if (req.body.published !== undefined) {
            req.body.published = Boolean(req.body.published);
        } else {
            req.body.published = false; // Default to false if not provided
        }

        // Process tags: convert string tags to ObjectIds
        if (req.body.tags && req.body.tags.length > 0) {
            const tagIds = [];
            for (const tagName of req.body.tags) {
                let tag = await Tag.findOne({ name: tagName.toLowerCase() });
                if (!tag) {
                    // If tag doesn't exist, create it
                    tag = await Tag.create({ name: tagName.toLowerCase() });
                }
                tagIds.push(tag._id);
            }
            req.body.tags = tagIds; // Replace string tags with ObjectIds
        }

        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res, next) => {
    try {
        // If user is authenticated, filter projects by user
        const query = req.user ? { user: req.user.id } : {};
        
        const projects = await Project.find(query).populate({
            path: 'user',
            select: 'name email'
        });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id).populate({
            path: 'user',
            select: 'name email'
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: `Project not found with id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: `Project not found with id of ${req.params.id}`
            });
        }

        // Make sure user is project owner
        if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this project`
            });
        }

        // Ensure published field is a boolean
        if (req.body.published !== undefined) {
            req.body.published = Boolean(req.body.published);
        }

        // Process tags if included in the update
        if (req.body.tags && req.body.tags.length > 0) {
            const tagIds = [];
            for (const tagName of req.body.tags) {
                let tag = await Tag.findOne({ name: tagName.toLowerCase() });
                if (!tag) {
                    // If tag doesn't exist, create it
                    tag = await Tag.create({ name: tagName.toLowerCase() });
                }
                tagIds.push(tag._id);
            }
            req.body.tags = tagIds; // Replace string tags with ObjectIds
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: `Project not found with id of ${req.params.id}`
            });
        }

        // Make sure user is project owner
        if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this project`
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent projects
// @route   GET /api/projects/recent
// @access  Private 
exports.getRecentProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5) // Limit to 5 recent projects, adjust as needed
            .populate('user', 'name');

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle project publish status
// @route   PUT /api/projects/:id/publish
// @access  Private
exports.togglePublishStatus = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: `Project not found with id of ${req.params.id}`
            });
        }

        // Make sure user is project owner
        if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this project`
            });
        }

        // Toggle the published status
        project = await Project.findByIdAndUpdate(
            req.params.id,
            { published: !project.published },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};