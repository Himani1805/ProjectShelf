const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a project title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a project description']
    },
    content: {
        type: String,
        required: [true, 'Please provide project content']
    },
    imageUrl: {
        type: String,
        default: 'default-project.jpg'
    },
    thumbnail: {
        type: String
    },
    images: [{
        type: String
    }],
    published: {
        type: Boolean,
        default: false
    },
    technologies: [{
        type: String
    }],
    githubUrl: {
        type: String
    },
    liveUrl: {
        type: String
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Tag'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);