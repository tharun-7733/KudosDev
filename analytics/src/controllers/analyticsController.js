const crypto = require('crypto');
const Visitor = require('../models/Visitor');
const Visit = require('../models/Visit');
const AppError = require('../utils/AppError');

const hashIp = (ip) => crypto.createHash('sha256').update(ip).digest('hex');

const getClientIp = (req) =>
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '0.0.0.0';

/**
 * POST /api/analytics/track
 * Body: { page: string }
 */
exports.trackVisit = async (req, res, next) => {
    try {
        const { page } = req.body;
        if (!page) return next(new AppError('Field "page" is required', 400));

        const clientIp = getClientIp(req);
        const hashed = hashIp(clientIp);
        const now = new Date();

        // Always log the visit
        await Visit.create({
            hashedIp: hashed,
            page,
            userAgent: req.headers['user-agent'] || '',
            referrer: req.headers['referer'] || '',
            visitedAt: now,
        });

        // Check for recent visit from same IP on same page (1-hour window)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentVisit = await Visit.findOne({
            hashedIp: hashed,
            page,
            visitedAt: { $gte: oneHourAgo, $lt: now },
        }).lean();

        // Update aggregate counters
        const updateOps = { $inc: { totalViews: 1 }, $set: { lastVisitedAt: now } };
        if (!recentVisit) {
            updateOps.$inc.uniqueVisitors = 1;
        }

        await Visitor.findOneAndUpdate({ page }, updateOps, { upsert: true, new: true });

        return res.status(200).json({
            status: 'success',
            message: 'Visit recorded',
            isNewVisitor: !recentVisit,
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * GET /api/analytics/stats/:page
 */
exports.getPageStats = async (req, res, next) => {
    try {
        const { page } = req.params;
        const stats = await Visitor.findOne({ page })
            .select('page uniqueVisitors totalViews lastVisitedAt -_id')
            .lean();

        if (!stats) {
            return res.status(200).json({
                status: 'success',
                data: { page, uniqueVisitors: 0, totalViews: 0, lastVisitedAt: null },
            });
        }
        return res.status(200).json({ status: 'success', data: stats });
    } catch (err) {
        return next(err);
    }
};

/**
 * GET /api/analytics/stats
 */
exports.getAllStats = async (req, res, next) => {
    try {
        const [aggregate] = await Visitor.aggregate([
            {
                $group: {
                    _id: null,
                    totalUniqueVisitors: { $sum: '$uniqueVisitors' },
                    totalViews: { $sum: '$totalViews' },
                    pageCount: { $sum: 1 },
                },
            },
        ]);

        const pages = await Visitor.find()
            .select('page uniqueVisitors totalViews lastVisitedAt -_id')
            .sort({ totalViews: -1 })
            .lean();

        return res.status(200).json({
            status: 'success',
            data: {
                summary: aggregate || { totalUniqueVisitors: 0, totalViews: 0, pageCount: 0 },
                pages,
            },
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * GET /api/analytics/health
 */
exports.healthCheck = async (_req, res) => {
    const mongoose = require('mongoose');
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.status(200).json({
        status: 'success',
        message: 'Analytics service is running',
        database: dbState[mongoose.connection.readyState] || 'unknown',
        uptime: process.uptime().toFixed(0) + 's',
    });
};

// ─── Convenience Endpoints ─────────────────────────────────────────────────────

/**
 * Helper: track a view for a specific page type.
 */
const trackPageView = async (req, res, next, pagePrefix) => {
    const { id } = req.params;
    if (!id) return next(new AppError('ID parameter is required', 400));
    req.body.page = `${pagePrefix}/${id}`;
    return exports.trackVisit(req, res, next);
};

/**
 * POST /api/analytics/profile-view/:id
 * Tracks a profile page visit.
 */
exports.trackProfileView = (req, res, next) => trackPageView(req, res, next, '/profile');

/**
 * POST /api/analytics/blog-view/:id
 * Tracks a blog post visit.
 */
exports.trackBlogView = (req, res, next) => trackPageView(req, res, next, '/blog');

/**
 * POST /api/analytics/repo-view/:id
 * Tracks a project/repo visit.
 */
exports.trackRepoView = (req, res, next) => trackPageView(req, res, next, '/repo');

/**
 * GET /api/analytics/debug/db
 * Returns raw database state for debugging (dev only).
 */
exports.debugDB = async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return next(new AppError('Debug endpoint disabled in production', 403));
        }

        const visitors = await Visitor.find().select('-_id').lean();
        const visits = await Visit.find().sort({ visitedAt: -1 }).limit(20).select('-_id').lean();

        return res.status(200).json({
            status: 'success',
            data: {
                visitors: { count: visitors.length, documents: visitors },
                visits: { count: visits.length, documents: visits },
            },
        });
    } catch (err) {
        return next(err);
    }
};
