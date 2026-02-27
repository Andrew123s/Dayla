const mongoose = require('mongoose');

// ─── Sub-schema: individual packing item ──────────────────────────────
const packingItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  category: {
    type: String,
    enum: [
      'clothing', 'toiletries', 'electronics', 'documents', 'medicine',
      'gear', 'food', 'accessories', 'footwear', 'weather_essentials',
      'cultural', 'entertainment', 'safety', 'other'
    ],
    default: 'other'
  },
  quantity: { type: Number, default: 1, min: 1, max: 50 },
  packed: { type: Boolean, default: false },
  packedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  packedAt: { type: Date, default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  weight: { type: Number, default: 0, min: 0 }, // grams
  volume: { type: Number, default: 0, min: 0 }, // cubic cm
  isEssential: { type: Boolean, default: false },
  isShared: { type: Boolean, default: false },
  source: {
    type: String,
    enum: ['manual', 'weather', 'activity', 'duration', 'cultural', 'template', 'memory'],
    default: 'manual'
  },
  shopUrl: { type: String, default: null },
  notes: { type: String, maxlength: 200, default: '' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now },
}, { _id: true });

// ─── Sub-schema: luggage / bag container ──────────────────────────────
const luggageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, default: 'Main Bag' },
  type: {
    type: String,
    enum: ['carry_on', 'checked', 'personal', 'backpack', 'duffel', 'other'],
    default: 'checked'
  },
  maxWeight: { type: Number, default: 23000 }, // grams  (23 kg standard)
  maxVolume: { type: Number, default: 62000 }, // cm³ (~62 L)
  currentWeight: { type: Number, default: 0 },
  currentVolume: { type: Number, default: 0 },
  airline: { type: String, default: '' },
  color: { type: String, default: '#3a5a40' },
}, { _id: true });

// ─── Main PackingList schema ──────────────────────────────────────────
const packingListSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['editor', 'viewer'], default: 'editor' }
  }],
  items: [packingItemSchema],
  luggage: [luggageSchema],
  // Generation metadata
  generatedFrom: {
    weather: { type: Boolean, default: false },
    activities: [String],
    duration: { type: Number, default: 0 }, // days
    destination: { type: String, default: '' },
    destinationCountry: { type: String, default: '' },
    temperature: { avgC: Number, minC: Number, maxC: Number },
    conditions: [String], // ['Rainy', 'Sunny', etc.]
  },
  // Airline compliance
  airlineRestrictions: {
    airline: { type: String, default: '' },
    carryOnWeight: { type: Number, default: 7000 }, // grams
    carryOnDimensions: { l: Number, w: Number, h: Number }, // cm
    checkedWeight: { type: Number, default: 23000 },
    checkedCount: { type: Number, default: 1 },
    prohibitedItems: [String],
  },
  isComplete: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ─── Indexes ──────────────────────────────────────────────────────────
packingListSchema.index({ tripId: 1 });
packingListSchema.index({ owner: 1, createdAt: -1 });
packingListSchema.index({ 'collaborators.user': 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────
packingListSchema.virtual('totalItems').get(function () {
  return this.items.length;
});

packingListSchema.virtual('packedItems').get(function () {
  return this.items.filter(i => i.packed).length;
});

packingListSchema.virtual('progress').get(function () {
  if (this.items.length === 0) return 0;
  return Math.round((this.items.filter(i => i.packed).length / this.items.length) * 100);
});

packingListSchema.virtual('totalWeight').get(function () {
  return this.items.reduce((sum, i) => sum + (i.weight * i.quantity), 0);
});

packingListSchema.virtual('totalVolume').get(function () {
  return this.items.reduce((sum, i) => sum + (i.volume * i.quantity), 0);
});

// ─── Instance methods ─────────────────────────────────────────────────
packingListSchema.methods.findDuplicates = function () {
  const nameMap = new Map();
  const duplicates = [];
  this.items.forEach(item => {
    const key = item.name.toLowerCase().trim();
    if (nameMap.has(key)) {
      duplicates.push({ existing: nameMap.get(key), duplicate: item });
    } else {
      nameMap.set(key, item);
    }
  });
  return duplicates;
};

packingListSchema.methods.recalcLuggage = function () {
  this.luggage.forEach(bag => {
    const assignedItems = this.items.filter(i =>
      i.assignedTo && i.assignedTo.toString() === bag._id.toString()
    );
    bag.currentWeight = assignedItems.reduce((s, i) => s + (i.weight * i.quantity), 0);
    bag.currentVolume = assignedItems.reduce((s, i) => s + (i.volume * i.quantity), 0);
  });
  return this;
};

// ─── Static methods ───────────────────────────────────────────────────
packingListSchema.statics.getForTrip = function (tripId) {
  return this.findOne({ tripId })
    .populate('owner', 'name avatar')
    .populate('collaborators.user', 'name avatar')
    .populate('items.addedBy', 'name avatar')
    .populate('items.assignedTo', 'name avatar')
    .populate('items.packedBy', 'name avatar');
};

const PackingList = mongoose.model('PackingList', packingListSchema);
module.exports = PackingList;
