const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
    {
        hashedIp: {
            type: String,
            required: [true, 'Hashed IP is required'],
            index: true,
        },
        page: {
            type: String,
            required: [true, 'Page identifier is required'],
            trim: true,
        },
        userAgent: {
            type: String,
            default: '',
        },
        referrer: {
            type: String,
            default: '',
        },
        visitedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
    }
);

visitSchema.index({ hashedIp: 1, page: 1, visitedAt: -1 });
visitSchema.index({ visitedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Visit', visitSchema);
