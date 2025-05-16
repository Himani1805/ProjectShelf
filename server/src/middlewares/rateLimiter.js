const rateLimit = require('express-rate-limit');

// Create a limiter for general API requests
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

// Create a more lenient limiter for authentication routes during development
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs during development
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes'
    }
});

// For production, you might want to use these stricter settings:
// windowMs: 60 * 60 * 1000, // 1 hour
// max: 10, // limit each IP to 10 requests per windowMs

module.exports = {
    apiLimiter,
    authLimiter
};