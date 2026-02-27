const mongoose = require('mongoose');

// Tracks what users packed (and used/unused) across trips
// Powers the "Memory & Learning" features
const packingHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  itemName: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  wasUsed: { type: Boolean, default: null }, // null = not yet reported
  isFavorite: { type: Boolean, default: false },
  destination: { type: String, default: '' },
  destinationCountry: { type: String, default: '' },
  season: { type: String, enum: ['spring', 'summer', 'autumn', 'winter'], default: 'summer' },
  tripCategory: { type: String, default: 'other' }, // hiking, business, etc.
  packedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Indexes for efficient queries
packingHistorySchema.index({ userId: 1, itemName: 1 });
packingHistorySchema.index({ userId: 1, destination: 1 });
packingHistorySchema.index({ userId: 1, season: 1 });
packingHistorySchema.index({ userId: 1, isFavorite: 1 });
packingHistorySchema.index({ userId: 1, wasUsed: 1, itemName: 1 });

// Static: get items the user never used in past trips
packingHistorySchema.statics.getUnusedItems = async function (userId, limit = 20) {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId), wasUsed: false } },
    { $group: { _id: '$itemName', count: { $sum: 1 }, category: { $first: '$category' } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ];
  return this.aggregate(pipeline);
};

// Static: get frequently used items (favorites / high-use)
packingHistorySchema.statics.getFrequentItems = async function (userId, limit = 20) {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId), wasUsed: true } },
    { $group: { _id: '$itemName', count: { $sum: 1 }, category: { $first: '$category' } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ];
  return this.aggregate(pipeline);
};

// Static: get pattern for destination + season
packingHistorySchema.statics.getPatternItems = async function (userId, destination, season) {
  const match = { userId: new mongoose.Types.ObjectId(userId), wasUsed: true };
  if (destination) match.destination = new RegExp(destination, 'i');
  if (season) match.season = season;

  const pipeline = [
    { $match: match },
    { $group: { _id: '$itemName', count: { $sum: 1 }, category: { $first: '$category' } } },
    { $sort: { count: -1 } },
    { $limit: 30 },
  ];
  return this.aggregate(pipeline);
};

const PackingHistory = mongoose.model('PackingHistory', packingHistorySchema);
module.exports = PackingHistory;
