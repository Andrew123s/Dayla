const mongoose = require('mongoose');

/**
 * Webhook event log + idempotency guard. Every Stripe event we receive is
 * recorded here keyed by its unique event id; a duplicate delivery (Stripe
 * retries aggressively) is detected by the unique index and skipped. Doubles as
 * the "log all webhook events" audit trail and the source for checkout
 * conversion analytics.
 */
const billingEventSchema = new mongoose.Schema({
  stripeEventId: { type: String, required: true, unique: true },
  type: { type: String, required: true, index: true },
  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Small human-readable summary of what the event did (never the full payload).
  summary: { type: String, default: '' },
  eventCreatedAt: { type: Number, default: 0 }, // Stripe event.created (seconds)
  processedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('BillingEvent', billingEventSchema);
