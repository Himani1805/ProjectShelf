const Comment = require('../models/commentModel');
const Project = require('../models/projectModel');
const CaseStudy = require('../models/caseStudyModel');

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
    try {
        const { content, refType, refId, parentComment } = req.body;

        // Validate reference type
        if (!['Project', 'CaseStudy'].includes(refType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reference type'
            });
        }

        // Check if referenced document exists
        let refDoc;
        if (refType === 'Project') {
            refDoc = await Project.findById(refId);
        } else {
            refDoc = await CaseStudy.findById(refId);
        }

        if (!refDoc) {
            return res.status(404).json({
                success: false,
                message: `${refType} not found with id of ${refId}`
            });
        }

        // Check if parent comment exists if provided
        if (parentComment) {
            const parentCommentDoc = await Comment.findById(parentComment);
            if (!parentCommentDoc) {
                return res.status(404).json({
                    success: false,
                    message: `Parent comment not found with id of ${parentComment}`
                });
            }
        }

        // Create comment
        const comment = await Comment.create({
            content,
            refType,
            refId,
            user: req.user.id,
            parentComment: parentComment || null
        });

        // Populate user data
        await comment.populate('user', 'name email profileImage');

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get comments for a specific content
// @route   GET /api/comments/:refType/:refId
// @access  Public
exports.getComments = async (req, res, next) => {
    try {
        const { refType, refId } = req.params;

        // Validate reference type
        if (!['Project', 'CaseStudy'].includes(refType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reference type'
            });
        }

        // Get top-level comments (no parent)
        const comments = await Comment.find({
            refType,
            refId,
            parentComment: null
        })
            .sort('-createdAt')
            .populate('user', 'name email profileImage')
            .populate({
                path: 'reactions.likes',
                select: 'name'
            });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({
                    parentComment: comment._id
                })
                    .sort('createdAt')
                    .populate('user', 'name email profileImage')
                    .populate({
                        path: 'reactions.likes',
                        select: 'name'
                    });

                return {
                    ...comment.toObject(),
                    replies
                };
            })
        );

        res.status(200).json({
            success: true,
            count: comments.length,
            data: commentsWithReplies
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
    try {
        const { content } = req.body;

        let comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: `Comment not found with id of ${req.params.id}`
            });
        }

        // Check if user is the comment owner
        if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        comment.content = content;
        await comment.save();

        res.status(200).json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: `Comment not found with id of ${req.params.id}`
            });
        }

        // Check if user is the comment owner or content owner
        const isCommentOwner = comment.user.toString() === req.user.id;

        let isContentOwner = false;
        if (comment.refType === 'Project') {
            const project = await Project.findById(comment.refId);
            isContentOwner = project && project.user.toString() === req.user.id;
        } else if (comment.refType === 'CaseStudy') {
            const caseStudy = await CaseStudy.findById(comment.refId);
            isContentOwner = caseStudy && caseStudy.user.toString() === req.user.id;
        }

        if (!isCommentOwner && !isContentOwner && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // Delete comment and its replies
        await Comment.deleteMany({
            $or: [
                { _id: req.params.id },
                { parentComment: req.params.id }
            ]
        });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle like on a comment
// @route   PUT /api/comments/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: `Comment not found with id of ${req.params.id}`
            });
        }

        // Check if user already liked the comment
        const likeIndex = comment.reactions.likes.indexOf(req.user.id);

        if (likeIndex === -1) {
            // Add like
            comment.reactions.likes.push(req.user.id);
        } else {
            // Remove like
            comment.reactions.likes.splice(likeIndex, 1);
        }

        await comment.save();

        res.status(200).json({
            success: true,
            data: {
                likes: comment.reactions.likes
            }
        });
    } catch (error) {
        next(error);
    }
};