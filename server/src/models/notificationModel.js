const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['comment', 'like', 'mention', 'system', 'follow'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    refType: {
        type: String,
        enum: ['Project', 'CaseStudy', 'Comment', 'User']
    },
    refId: {
        type: mongoose.Schema.ObjectId,
        refPath: 'refType'
    },
    read: {
        type: Boolean,
        default: false
    },
    link: String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);