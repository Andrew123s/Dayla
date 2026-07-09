const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getPlans,
  getSubscription,
  createCheckoutSession,
  createCustomerPortal,
  handleRevenueCatWebhook,
  getAdminMetrics,
  getStripeConfigCheck,
} = require('../controllers/billing.controller');

const router = express.Router();

// NOTE: POST /api/billing/webhook is mounted directly in app.js (raw body,
// no auth) — it must not go through the JSON parser or `protect`.

// RevenueCat webhook (mobile in-app purchases): plain JSON, authenticated by
// a shared Authorization header inside the handler — so it goes BEFORE protect.
router.post('/revenuecat-webhook', handleRevenueCatWebhook);

router.use(protect);

router.get('/plans', getPlans);
router.get('/subscription', getSubscription);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/customer-portal', createCustomerPortal);

// Admin analytics (gated inside the controller via ADMIN_EMAILS)
router.get('/admin/metrics', getAdminMetrics);
router.get('/admin/stripe-check', getStripeConfigCheck);

module.exports = router;
