const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/userMiddleware');

// Apply auth middleware to all routes

// Dashboard routes
router.get('/dashboard',authMiddleware, userController.getDashboardData);
router.put('/onboarding/task', userController.updateOnboardingTask);
router.put('/profile',authMiddleware, userController.updateProfile);
router.put('/payment-method',authMiddleware, userController.updatePaymentMethod);

module.exports = router;