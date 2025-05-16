const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Please provide comment content'],
        trim: true,
        maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    // Reference to project or case study
    refType: {
        type: String,
        enum: ['Project', 'CaseStudy'],
        required: true
    },
    refId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        refPath: 'refType'
    },
    // User who made the comment
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // For nested comments/replies
    parentComment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
        default: null
    },
    // Reactions/likes
    reactions: {
        likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);