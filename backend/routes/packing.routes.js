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

// Memory & templates (no tripId needed)
router.get('/memory', protect, getMemory);
router.get('/templates', protect, getTemplates);

// Trip-specific routes
router.get('/:tripId', protect, getPackingList);
router.post('/:tripId/generate', protect, generateList);
router.post('/:tripId/items', protect, addItem);
router.put('/:tripId/items/:itemId', protect, updateItem);
router.delete('/:tripId/items/:itemId', protect, removeItem);
router.post('/:tripId/luggage', protect, addLuggage);
router.delete('/:tripId/luggage/:luggageId', protect, removeLuggage);
router.get('/:tripId/suggestions', protect, getSuggestions);
router.post('/:tripId/report', protect, reportUsage);
router.post('/:tripId/apply-template', protect, applyTemplate);

module.exports = router;
