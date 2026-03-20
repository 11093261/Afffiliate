const mongoose = require("mongoose");

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.DATA_BASE_URL, {
            family: 4,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ Database connected successfully");

        // event listeners
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