const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error('FATAL: MONGO_URI is not defined in environment variables.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1);
    }

    mongoose.connection.on('error', (err) => {
        console.error(`MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting to reconnect…');
    });
};

module.exports = connectDB;
