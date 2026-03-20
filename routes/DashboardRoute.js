const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/userMiddleware');
const userController = require('../controllers/userController');

// Add debug route to test authentication
router.get('/debug-auth', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication is working',
    user: req.user,
    userId: req.userId,
    timestamp: new Date().toISOString()
  });
});

// Add health check route (no auth needed)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== MAIN ROUTES ====================

// GET /api/dashboard - Get dashboard data
router.get('/dashboard', authMiddleware, userController.getDashboardData);

// PUT /api/users/onboarding/task - Update onboarding task
router.put('/users/onboarding/task', authMiddleware, userController.updateOnboardingTask);

// PUT /api/profile - Update user profile
router.put('/profile', authMiddleware, userController.updateProfile);

// PUT /api/payment-method - Update payment method
router.put('/payment-method', authMiddleware, userController.updatePaymentMethod);

module.exports = router;