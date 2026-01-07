const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyAdminToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Authorization header missing or invalid" });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        req.user = decoded
      
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        console.error("Token verification error:", error);
        res.status(500).json({ message: "Authentication failed" });
    }
};

module.exports = verifyAdminToken;


