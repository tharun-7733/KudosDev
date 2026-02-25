const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many requests. Please try again later.',
    },
});

module.exports = limiter;
