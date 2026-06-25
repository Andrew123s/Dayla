const mongoose = require('mongoose');

// A single split share, in the expense's native currency.
const splitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Native amount in `currency`.
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  // FX snapshot: value of `amount` in USD at the time of writing. Stored so
  // historical totals don't drift when live rates change.
  amountUSD: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: 'other'
  },
  // ISO date string, YYYY-MM-DD (matches the client form representation).
  date: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitMethod: {
    type: String,
    enum: ['equal', 'percent', 'custom'],
    default: 'equal'
  },
  splits: {
    type: [splitSchema],
    default: []
  },
  receiptUrl: {
    type: String,
    default: null
  },
  settled: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

expenseSchema.index({ tripId: 1, createdAt: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
