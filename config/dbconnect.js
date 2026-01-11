// dbconnect.js - UPDATED VERSION
const mongoose = require("mongoose");
require("dotenv").config();

const dbconnect = async () => {
    try {
        // Remove deprecated options and add critical ones
        await mongoose.connect(process.env.DATA_BASE_URL, {
            // Force IPv4 to avoid DNS issues with Node.js 17+
            family: 4,
            // Fail faster on initial connection (5 seconds)
            serverSelectionTimeoutMS: 5000,
            // Close sockets after 45 seconds of inactivity
            socketTimeoutMS: 45000,
        });
        console.log("✅ Database connected successfully");

        // Optional: Connection event listeners for monitoring
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });

        return mongoose.connection;

    } catch (error) {
        console.error("❌ Database connection FAILED:", error.message);
        process.exit(1);
    }
};

module.exports = dbconnect;