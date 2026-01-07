const mongoose = require("mongoose")
require("dotenv").config()

const dbconnect = async () => {
    try {
         await mongoose.connect(process.env.DATA_BASE_URL)
        console.log("Database connected successfully") 
    } catch (error) {
        console.error("Database connection error:", error)
        process.exit(1) 
    }
}

module.exports = dbconnect