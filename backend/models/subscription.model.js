const mongoose = require('mongoose');

/**
 * Subscription ledger — the source of truth for a user's billing, one document
 * per Stripe subscription. The User model carries a denormalized snapshot for
 * fast permission checks; this collection holds the full record and history and
 * powers admin analytics.
 */
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planType: {
    type: String,
    enum: ['free', 'pro'],
    default: 'pro'
  },
  status: {
    type: String,
    enum: ['active', 'trialing', 'past_due', 'canceled', 'inactive', 'incomplete'],
    default: 'inactive'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual', null],
    default: null
  },
  stripeCustomerId: { type: String, default: null, index: true },
  // Unique + sparse: at most one ledger row per Stripe subscription, but rows
  // without one (shouldn't happen) don't collide on null.
  stripeSubscriptionId: { type: String, default: null, unique: true, sparse: true },
  stripePriceId: { type: String, default: null },
  amount: { type: Number, default: 0 },      // minor units (cents)
  currency: { type: String, default: 'eur' },
  currentPeriodStart: { type: Date, default: null },
  currentPeriodEnd: { type: Date, default: null },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  canceledAt: { type: Date, default: null },
  // Timestamp (Stripe `event.created`, seconds) of the newest event applied to
  // this row — lets webhook handlers ignore out-of-order/stale events.
  lastStripeEventAt: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
