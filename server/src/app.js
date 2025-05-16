const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');
const { swaggerUi, swaggerDocs } = require('./config/swagger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const caseStudyRoutes = require('./routes/caseStudyRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const commentRoutes = require('./routes/commentRoutes');
const tagRoutes = require('./routes/tagRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const exportRoutes = require('./routes/exportRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
    origin: ['https://projectshelfs.vercel.app', 'http://localhost:5173', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(cookieParser());
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('error', (req, res) => res.statusCode >= 400 ? 'Error' : 'Success');
app.use(morgan(':date[iso] :method :url :status :response-time ms - :error - :body'));;

// We have to Add this after your middleware setup but before your routes for the Swagger UI to work correctly.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Apply rate limiting to all routes
app.use('/api', apiLimiter);
// Apply stricter rate limiting to auth routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/collaborations', collaborationRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to Project Shelf API');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

module.exports = app;