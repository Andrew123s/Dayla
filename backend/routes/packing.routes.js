const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getPackingList,
  generateList,
  addItem,
  updateItem,
  removeItem,
  addLuggage,
  removeLuggage,
  getSuggestions,
  reportUsage,
  getMemory,
  getTemplates,
  applyTemplate,
} = require('../controllers/packing.controller');

// Validate :tripId is a valid MongoDB ObjectId before hitting any trip-specific handler
const validateTripId = (req, res, next) => {
  if (!req.params.tripId || !req.params.tripId.match(/^[a-f\d]{24}$/i)) {
    return res.status(400).json({ success: false, message: 'Invalid trip ID' });
  }
  next();
};

// Memory & templates (no tripId needed)
router.get('/memory', protect, getMemory);
router.get('/templates', protect, getTemplates);

// Trip-specific routes
router.get('/:tripId', protect, validateTripId, getPackingList);
router.post('/:tripId/generate', protect, validateTripId, generateList);
router.post('/:tripId/items', protect, validateTripId, addItem);
router.put('/:tripId/items/:itemId', protect, validateTripId, updateItem);
router.delete('/:tripId/items/:itemId', protect, validateTripId, removeItem);
router.post('/:tripId/luggage', protect, validateTripId, addLuggage);
router.delete('/:tripId/luggage/:luggageId', protect, validateTripId, removeLuggage);
router.get('/:tripId/suggestions', protect, validateTripId, getSuggestions);
router.post('/:tripId/report', protect, validateTripId, reportUsage);
router.post('/:tripId/apply-template', protect, validateTripId, applyTemplate);

module.exports = router;
