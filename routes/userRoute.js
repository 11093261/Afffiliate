const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/userController');
const authMiddleware = require('../middleware/userMiddleware'); // Add this

router.get(
  '/dashboard', 
  authMiddleware, // Add authentication middleware
  dashboardController.getDashboardData
);

router.put(
  '/onboarding/:task', 
  authMiddleware, // Add authentication middleware
  dashboardController.updateOnboardingTask
);

router.post(
  '/join', 
  authMiddleware, // Add authentication middleware
  dashboardController.joinProgram
);
module.exports = router