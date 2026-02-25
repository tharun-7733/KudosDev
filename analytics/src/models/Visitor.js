const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
    {
        page: {
            type: String,
            required: [true, 'Page identifier is required'],
            trim: true,
        },
        uniqueVisitors: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalViews: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastVisitedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

visitorSchema.index({ page: 1 }, { unique: true });

module.exports = mongoose.model('Visitor', visitorSchema);
