const express = require('express');
const {
  validateConnection,
  calculateTransport,
  calculateAccommodation,
  calculateFood,
  calculateTrip,
  calculateRealtime,
} = require('../controllers/climatiq.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { requirePro } = require('../middleware/subscription.middleware');

const router = express.Router();

// Public route - validate connection
router.get('/validate', validateConnection);

// Protected routes - require authentication
router.use(protect);

// The Footprint Calculator (Eco-Tracker) is a Pro feature.
const pro = requirePro('footprint');

// Calculate emissions
router.post('/transport', pro, calculateTransport);
router.post('/accommodation', pro, calculateAccommodation);
router.post('/food', pro, calculateFood);
router.post('/trip', pro, calculateTrip);
router.post('/realtime', pro, calculateRealtime);

module.exports = router;
