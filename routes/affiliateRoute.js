const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/userMiddleware');
const affiliateController = require('../controllers/affilliateController'); // Your controller
const userController = require('../controllers/userController'); // Contains createAffiliateLink & getPerformanceStats

// GET /api/affiliate/links – user’s link history
router.get('/links', authMiddleware, affiliateController.getUserLinks);

// POST /api/affiliate/links – create a new affiliate link
// router.post('/links', authMiddleware, userController.createAffiliateLink);

// DELETE /api/affiliate/links/:id – delete a link
router.delete('/links/:id', authMiddleware, affiliateController.deleteUserLink);

// GET /api/affiliate/stats/performance – performance stats
// router.get('/stats/performance', authMiddleware, userController.getPerformanceStats);

module.exports = router;