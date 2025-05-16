const Analytics = require('../models/analyticsModel');
const Project = require('../models/projectModel');
const CaseStudy = require('../models/caseStudyModel');

// @desc    Record a page view
// @route   POST /api/analytics/view
// @access  Public
exports.recordView = async (req, res, next) => {
    try {
        const { refType, refId, visitorId } = req.body;

        // Validate reference type
        if (!['Project', 'CaseStudy'].includes(refType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reference type'
            });
        }

        // Find the referenced document to get the owner
        let refDoc;
        if (refType === 'Project') {
            refDoc = await Project.findById(refId);
        } else {
            refDoc = await CaseStudy.findById(refId);
        }

        if (!refDoc) {
            return res.status(404).json({
                success: false,
                message: `${refType} not found with id of ${refId}`
            });
        }

        // Find or create analytics document
        let analytics = await Analytics.findOne({ refType, refId });

        if (!analytics) {
            analytics = await Analytics.create({
                refType,
                refId,
                owner: refDoc.user,
                views: 1,
                uniqueVisitors: [{
                    visitorId,
                    firstVisit: new Date(),
                    lastVisit: new Date(),
                    visitCount: 1
                }],
                dailyViews: [{
                    date: new Date().setHours(0, 0, 0, 0),
                    count: 1
                }]
            });
        } else {
            // Increment views
            analytics.views += 1;

            // Update or add visitor
            const visitorIndex = analytics.uniqueVisitors.findIndex(
                visitor => visitor.visitorId === visitorId
            );

            if (visitorIndex > -1) {
                analytics.uniqueVisitors[visitorIndex].lastVisit = new Date();
                analytics.uniqueVisitors[visitorIndex].visitCount += 1;
            } else {
                analytics.uniqueVisitors.push({
                    visitorId,
                    firstVisit: new Date(),
                    lastVisit: new Date(),
                    visitCount: 1
                });
            }

            // Update daily views
            const today = new Date().setHours(0, 0, 0, 0);
            const dailyViewIndex = analytics.dailyViews.findIndex(
                view => new Date(view.date).setHours(0, 0, 0, 0) === today
            );

            if (dailyViewIndex > -1) {
                analytics.dailyViews[dailyViewIndex].count += 1;
            } else {
                analytics.dailyViews.push({
                    date: today,
                    count: 1
                });
            }

            await analytics.save();
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Record a click-through
// @route   POST /api/analytics/click
// @access  Public
exports.recordClick = async (req, res, next) => {
    try {
        const { refType, refId, linkType, url } = req.body;

        // Find analytics document
        let analytics = await Analytics.findOne({ refType, refId });

        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: 'Analytics record not found'
            });
        }

        // Update click-throughs
        const clickIndex = analytics.clickThroughs.findIndex(
            click => click.linkType === linkType && click.url === url
        );

        if (clickIndex > -1) {
            analytics.clickThroughs[clickIndex].count += 1;
        } else {
            analytics.clickThroughs.push({
                linkType,
                count: 1,
                url
            });
        }

        await analytics.save();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Record engagement metrics
// @route   POST /api/analytics/engagement
// @access  Public
exports.recordEngagement = async (req, res, next) => {
    try {
        const { refType, refId, timeOnPage, scrollDepth, bounced } = req.body;

        // Find analytics document
        let analytics = await Analytics.findOne({ refType, refId });

        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: 'Analytics record not found'
            });
        }

        // Update engagement metrics
        if (!analytics.engagementMetrics) {
            analytics.engagementMetrics = {
                avgTimeOnPage: timeOnPage,
                scrollDepth: scrollDepth,
                bounceRate: bounced ? 100 : 0
            };
        } else {
            // Calculate new average time on page
            const currentAvg = analytics.engagementMetrics.avgTimeOnPage || 0;
            const totalViews = analytics.views;
            const newAvg = ((currentAvg * (totalViews - 1)) + timeOnPage) / totalViews;

            // Calculate new scroll depth average
            const currentScrollAvg = analytics.engagementMetrics.scrollDepth || 0;
            const newScrollAvg = ((currentScrollAvg * (totalViews - 1)) + scrollDepth) / totalViews;

            // Update bounce rate
            const currentBounces = (analytics.engagementMetrics.bounceRate || 0) * (totalViews - 1) / 100;
            const newBounces = bounced ? currentBounces + 1 : currentBounces;
            const newBounceRate = (newBounces / totalViews) * 100;

            analytics.engagementMetrics = {
                avgTimeOnPage: newAvg,
                scrollDepth: newScrollAvg,
                bounceRate: newBounceRate
            };
        }

        await analytics.save();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get analytics for a user's content
// @route   GET /api/analytics/user
// @access  Private
exports.getUserAnalytics = async (req, res, next) => {
    try {
        const analytics = await Analytics.find({ owner: req.user.id })
            .populate([
                {
                    path: 'refId',
                    select: 'title'
                }
            ]);

        // Aggregate data for dashboard
        const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
        const totalUniqueVisitors = new Set(
            analytics.flatMap(item => item.uniqueVisitors.map(v => v.visitorId))
        ).size;

        const totalClicks = analytics.reduce(
            (sum, item) => sum + item.clickThroughs.reduce((s, c) => s + c.count, 0),
            0
        );

        // Get top performing content
        const topContent = [...analytics].sort((a, b) => b.views - a.views).slice(0, 5);

        // Get daily views for chart
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const dailyViewsData = analytics.flatMap(item =>
            item.dailyViews.filter(dv => new Date(dv.date) >= last30Days)
        ).reduce((acc, curr) => {
            const dateStr = new Date(curr.date).toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + curr.count;
            return acc;
        }, {});

        const chartData = Object.entries(dailyViewsData).map(([date, count]) => ({
            date,
            count
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json({
            success: true,
            data: {
                totalViews,
                totalUniqueVisitors,
                totalClicks,
                topContent: topContent.map(item => ({
                    id: item._id,
                    refType: item.refType,
                    refId: item.refId,
                    title: item.refId.title,
                    views: item.views,
                    uniqueVisitors: item.uniqueVisitors.length,
                    clickThroughs: item.clickThroughs.reduce((sum, click) => sum + click.count, 0)
                })),
                chartData
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get detailed analytics for a specific content
// @route   GET /api/analytics/:refType/:refId
// @access  Private
exports.getContentAnalytics = async (req, res, next) => {
    try {
        const { refType, refId } = req.params;

        // Find the referenced document to verify ownership
        let refDoc;
        if (refType === 'Project') {
            refDoc = await Project.findById(refId);
        } else if (refType === 'CaseStudy') {
            refDoc = await CaseStudy.findById(refId);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid reference type'
            });
        }

        if (!refDoc) {
            return res.status(404).json({
                success: false,
                message: `${refType} not found with id of ${refId}`
            });
        }

        // Check ownership
        if (refDoc.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access these analytics'
            });
        }

        const analytics = await Analytics.findOne({ refType, refId });

        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: 'No analytics data found for this content'
            });
        }

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
    try {
        const { timeframe } = req.query;
        
        // Calculate the start date based on timeframe
        const startDate = new Date();
        switch (timeframe) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7); // Default to week
        }

        // Get analytics for the user's content
        const analytics = await Analytics.find({
            owner: req.user.id,
            createdAt: { $gte: startDate }
        }).populate('refId', 'title');

        // Calculate overview metrics
        const overview = {
            totalProjects: await Project.countDocuments({ user: req.user.id }),
            totalViews: analytics.reduce((sum, item) => sum + item.views, 0),
            totalLikes: analytics.reduce((sum, item) => sum + (item.engagementMetrics?.likes || 0), 0),
            totalComments: analytics.reduce((sum, item) => sum + (item.engagementMetrics?.comments || 0), 0)
        };

        // Calculate views data for the chart
        const viewsData = [];
        const currentDate = new Date();
        let iterDate = new Date(startDate);
        
        while (iterDate <= currentDate) {
            const dateStr = iterDate.toISOString().split('T')[0];
            const dayViews = analytics.reduce((sum, item) => {
                const dayData = item.dailyViews.find(
                    dv => new Date(dv.date).toISOString().split('T')[0] === dateStr
                );
                return sum + (dayData?.count || 0);
            }, 0);
            
            viewsData.push({
                date: dateStr,
                views: dayViews
            });
            
            iterDate.setDate(iterDate.getDate() + 1);
        }

        // Get project performance data
        const projectPerformance = analytics
            .filter(item => item.refType === 'Project')
            .map(item => ({
                title: item.refId?.title || 'Unknown Project',
                views: item.views,
                likes: item.engagementMetrics?.likes || 0,
                comments: item.engagementMetrics?.comments || 0
            }))
            .sort((a, b) => b.views - a.views);

        // Calculate traffic sources
        const trafficSources = analytics.reduce((sources, item) => {
            item.referrers?.forEach(ref => {
                const existingSource = sources.find(s => s.source === ref.source);
                if (existingSource) {
                    existingSource.percentage += ref.count;
                } else {
                    sources.push({
                        source: ref.source || 'Direct',
                        percentage: ref.count
                    });
                }
            });
            return sources;
        }, []);

        // Convert traffic source counts to percentages
        const totalTraffic = trafficSources.reduce((sum, source) => sum + source.percentage, 0);
        trafficSources.forEach(source => {
            source.percentage = totalTraffic ? (source.percentage / totalTraffic) * 100 : 0;
        });

        // Calculate overall engagement rate
        const engagementRate = analytics.length > 0
            ? analytics.reduce((sum, item) => sum + (item.engagementMetrics?.avgTimeOnPage || 0), 0) / analytics.length
            : 0;

        res.status(200).json({
            success: true,
            data: {
                overview,
                viewsData,
                projectPerformance,
                trafficSources,
                engagementRate
            }
        });
    } catch (error) {
        next(error);
    }
};