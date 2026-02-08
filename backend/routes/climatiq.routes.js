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

const router = express.Router();

// Public route - validate connection
router.get('/validate', validateConnection);

// Protected routes - require authentication
router.use(protect);

// Calculate emissions
router.post('/transport', calculateTransport);
router.post('/accommodation', calculateAccommodation);
router.post('/food', calculateFood);
router.post('/trip', calculateTrip);
router.post('/realtime', calculateRealtime);

module.exports = router;
