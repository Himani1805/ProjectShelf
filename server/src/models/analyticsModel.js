const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
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
    // User who owns the content
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Analytics data
    views: {
        type: Number,
        default: 0
    },
    uniqueVisitors: [{
        visitorId: String,
        firstVisit: Date,
        lastVisit: Date,
        visitCount: Number
    }],
    clickThroughs: [{
        linkType: {
            type: String,
            enum: ['github', 'live', 'custom', 'media', 'other'],
            required: true
        },
        count: {
            type: Number,
            default: 0
        },
        url: String
    }],
    engagementMetrics: {
        avgTimeOnPage: Number,
        scrollDepth: Number,
        bounceRate: Number
    },
    // Geographic data
    geoData: [{
        country: String,
        city: String,
        count: Number
    }],
    // Referral sources
    referrers: [{
        source: String,
        count: Number
    }],
    // Time-based data for charts
    dailyViews: [{
        date: Date,
        count: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);