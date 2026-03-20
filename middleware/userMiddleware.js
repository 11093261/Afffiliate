const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyAdminToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: "Authorization header missing or invalid" 
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Token missing" 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Log for debugging
        console.log('=== Token Verified ===');
        console.log('Decoded JWT:', decoded);
        
        // Extract user ID from decoded token
        // Handle different possible property names in JWT
        const userId = decoded.userId || decoded._id || decoded.id;
        
        if (!userId) {
            console.error('No user ID found in JWT token');
            return res.status(401).json({ 
                success: false,
                message: "Invalid token: No user ID found" 
            });
        }
        
        // Set req.userId as the user ID string
        req.userId = userId;
        
        // Also set req.user for backward compatibility
        req.user = {
            _id: userId,
            userId: userId,
            email: decoded.email || '',
            ...decoded
        };
        
        console.log('User authenticated. User ID:', userId);
        console.log('req.userId:', req.userId);
        console.log('req.user._id:', req.user._id);
        
        next();
    } catch (error) {
        console.error("=== Token Verification Error ===");
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Token expired. Please login again."
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token. Please login again."
            });
        }
        
        console.error("Unexpected token error:", error);
        res.status(500).json({ 
            success: false,
            message: "Authentication failed" 
        });
    }
};

module.exports = verifyAdminToken;