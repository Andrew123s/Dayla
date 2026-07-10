const express = require('express');
const { draftTrip } = require('../controllers/compass.controller');
const { protect } = require('../middleware/auth.middleware');

// Mounted at /api/compass. Pro gating (first draft free) happens in the
// controller so the 403 can carry the UPGRADE_REQUIRED code.
const router = express.Router();
router.use(protect);

router.post('/draft', draftTrip);

module.exports = router;
