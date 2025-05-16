const Tag = require('../models/tagModel');
const Project = require('../models/projectModel');

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Private (Admin)
exports.createTag = async (req, res, next) => {
    try {
        const { name, description, color } = req.body;

        // Check if tag already exists
        const existingTag = await Tag.findOne({ name: name.toLowerCase() });

        if (existingTag) {
            return res.status(400).json({
                success: false,
                message: 'Tag already exists'
            });
        }

        const tag = await Tag.create({
            name: name.toLowerCase(),
            description,
            color
        });

        res.status(201).json({
            success: true,
            data: tag
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
exports.getTags = async (req, res, next) => {
    try {
        const tags = await Tag.find().sort('name');

        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get popular tags
// @route   GET /api/tags/popular
// @access  Public
exports.getPopularTags = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const tags = await Tag.find()
            .sort('-count')
            .limit(limit);

        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private (Admin)
exports.updateTag = async (req, res, next) => {
    try {
        const { description, color } = req.body;

        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: `Tag not found with id of ${req.params.id}`
            });
        }

        // Update fields
        if (description !== undefined) tag.description = description;
        if (color !== undefined) tag.color = color;

        await tag.save();

        res.status(200).json({
            success: true,
            data: tag
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private (Admin)
exports.deleteTag = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: `Tag not found with id of ${req.params.id}`
            });
        }

        await tag.deleteOne();

        // Update projects that use this tag
        await Project.updateMany(
            { tags: tag._id },
            { $pull: { tags: tag._id } }
        );

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get projects by tag
// @route   GET /api/tags/:id/projects
// @access  Public
exports.getProjectsByTag = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: `Tag not found with id of ${req.params.id}`
            });
        }

        const projects = await Project.find({ tags: tag._id })
            .populate('user', 'name email profileImage')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};