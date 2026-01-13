const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/userMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Dashboard routes
router.get('/dashboard', userController.getDashboardData);
router.put('/onboarding/task', userController.updateOnboardingTask);
router.put('/profile', userController.updateProfile);
router.put('/payment-method', userController.updatePaymentMethod);

module.exports = router;