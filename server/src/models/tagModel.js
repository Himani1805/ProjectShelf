const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a tag name'],
        trim: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot be more than 200 characters']
    },
    color: {
        type: String,
        default: '#3498db'
    },
    count: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Tag', tagSchema);