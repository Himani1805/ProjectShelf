const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a case study title'],
        trim: true
    },
    projectOverview: {
        type: String,
        required: [true, 'Please provide a project overview']
    },
    mediaGallery: [
        {
            type: {
                type: String,
                enum: ['image', 'video'],
                required: true
            },
            url: {
                type: String,
                required: true
            },
            caption: String
        }
    ],
    timeline: [
        {
            title: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }
    ],
    technologies: [{
        type: String,
        required: [true, 'Please provide at least one technology']
    }],
    outcomes: {
        metrics: [{
            name: String,
            value: String
        }],
        testimonials: [{
            quote: String,
            author: String,
            position: String
        }]
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('CaseStudy', caseStudySchema);