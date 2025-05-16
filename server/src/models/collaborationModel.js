const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    collaborator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['editor', 'viewer'],
        default: 'viewer'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// Prevent duplicate collaborations
collaborationSchema.index({ project: 1, collaborator: 1 }, { unique: true });

module.exports = mongoose.model('Collaboration', collaborationSchema);