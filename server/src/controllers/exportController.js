const Project = require('../models/projectModel');
const CaseStudy = require('../models/caseStudyModel');
const Analytics = require('../models/analyticsModel');
const json2csv = require('json2csv').Parser;

// @desc    Export user's projects as CSV
// @route   GET /api/export/projects
// @access  Private
exports.exportProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ user: req.user.id })
            .populate('tags', 'name')
            .lean();

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No projects found to export'
            });
        }

        // Format data for CSV
        const formattedProjects = projects.map(project => ({
            title: project.title,
            description: project.description,
            technologies: project.technologies.join(', '),
            tags: project.tags.map(tag => tag.name).join(', '),
            githubUrl: project.githubUrl || '',
            liveUrl: project.liveUrl || '',
            createdAt: project.createdAt
        }));

        // Convert to CSV
        const fields = ['title', 'description', 'technologies', 'tags', 'githubUrl', 'liveUrl', 'createdAt'];
        const json2csvParser = new json2csv({ fields });
        const csv = json2csvParser.parse(formattedProjects);

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=projects.csv');

        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

// @desc    Export user's analytics as CSV
// @route   GET /api/export/analytics
// @access  Private
exports.exportAnalytics = async (req, res, next) => {
    try {
        const analytics = await Analytics.find({ owner: req.user.id })
            .populate({
                path: 'refId',
                select: 'title'
            })
            .lean();

        if (analytics.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No analytics found to export'
            });
        }

        // Format data for CSV
        const formattedAnalytics = analytics.map(item => ({
            contentType: item.refType,
            contentTitle: item.refId ? item.refId.title : 'Unknown',
            views: item.views,
            uniqueVisitors: item.uniqueVisitors.length,
            clickThroughs: item.clickThroughs.reduce((sum, click) => sum + click.count, 0),
            avgTimeOnPage: item.engagementMetrics ? item.engagementMetrics.avgTimeOnPage : 0,
            scrollDepth: item.engagementMetrics ? item.engagementMetrics.scrollDepth : 0,
            bounceRate: item.engagementMetrics ? item.engagementMetrics.bounceRate : 0
        }));

        // Convert to CSV
        const fields = ['contentType', 'contentTitle', 'views', 'uniqueVisitors', 'clickThroughs', 'avgTimeOnPage', 'scrollDepth', 'bounceRate'];
        const json2csvParser = new json2csv({ fields });
        const csv = json2csvParser.parse(formattedAnalytics);

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');

        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

// @desc    Export user's case studies as JSON
// @route   GET /api/export/case-studies
// @access  Private
exports.exportCaseStudies = async (req, res, next) => {
    try {
        const caseStudies = await CaseStudy.find({ user: req.user.id })
            .populate('project', 'title')
            .lean();

        if (caseStudies.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No case studies found to export'
            });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=case-studies.json');

        res.status(200).json(caseStudies);
    } catch (error) {
        next(error);
    }
};