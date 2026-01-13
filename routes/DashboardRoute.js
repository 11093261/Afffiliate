const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/userMiddleware');

// Import controller functions
const dashboardController = require('../controllers/DashboardController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ==================== EXACT ROUTES FROM FRONTEND ====================

// GET /api/users/dashboard - Get dashboard data
router.get('/users/dashboard', dashboardController.getDashboardData);

// GET /api/programs/recommended - Get recommended programs
router.get('/programs/recommended', dashboardController.getRecommendedPrograms);

// PUT /api/users/onboarding/task - Update onboarding task
router.put('/users/onboarding/task', dashboardController.updateOnboardingTask);

// POST /api/affiliate/links - Create affiliate link
router.post('/affiliate/links', dashboardController.createAffiliateLink);

// GET /api/affiliate/stats/performance - Get performance stats
router.get('/affiliate/stats/performance', dashboardController.getPerformanceStats);

module.exports = router;