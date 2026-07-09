const express = require('express');
const {
  listMemories,
  getMemory,
  generateMemory,
  shareMemory,
} = require('../controllers/memory.controller');
const { protect } = require('../middleware/auth.middleware');

// Mounted at /api/memories. All routes require authentication.
const router = express.Router();
router.use(protect);

router.get('/', listMemories);
router.get('/:id', getMemory);
router.post('/generate/:tripId', generateMemory);
router.post('/:id/share', shareMemory);

module.exports = router;
