const express = require('express');
const router = express.Router();
const {
    trackVisit,
    getPageStats,
    getAllStats,
    healthCheck,
    trackProfileView,
    trackBlogView,
    trackRepoView,
    debugDB,
} = require('../controllers/analyticsController');

// Health check
router.get('/health', healthCheck);

// Generic track
router.post('/track', trackVisit);

// Convenience view-tracking endpoints
router.post('/profile-view/:id', trackProfileView);
router.post('/blog-view/:id', trackBlogView);
router.post('/repo-view/:id', trackRepoView);

// Stats
router.get('/stats', getAllStats);
router.get('/stats/:page', getPageStats);

// Debug (dev only)
router.get('/debug/db', debugDB);

module.exports = router;
