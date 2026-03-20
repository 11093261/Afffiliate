const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/userMiddleware');

// Protected routes (all require authentication)
router.get('/dashboard', authMiddleware, userController.getDashboardData);
router.put('/onboarding/task', authMiddleware, userController.updateOnboardingTask);   // <-- added middleware
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/payment-method', authMiddleware, userController.updatePaymentMethod);

module.exports = router;