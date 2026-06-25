const mongoose = require('mongoose');

// A recorded settlement payment between two trip members. Amounts are stored
// directly in USD (the reconciliation base), mirroring the client model.
const settlementSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amountUSD: {
    type: Number,
    required: true,
    min: 0
  },
  // ISO date string, YYYY-MM-DD.
  date: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

settlementSchema.index({ tripId: 1, createdAt: -1 });

module.exports = mongoose.model('Settlement', settlementSchema);
