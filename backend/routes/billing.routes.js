const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getPlans,
  getSubscription,
  createCheckoutSession,
  createCustomerPortal,
} = require('../controllers/billing.controller');

const router = express.Router();

// NOTE: POST /api/billing/webhook is mounted directly in app.js (raw body,
// no auth) — it must not go through the JSON parser or `protect`.

router.use(protect);

router.get('/plans', getPlans);
router.get('/subscription', getSubscription);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/customer-portal', createCustomerPortal);

module.exports = router;
