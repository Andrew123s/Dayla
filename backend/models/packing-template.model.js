const mongoose = require('mongoose');

const templateItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  weight: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  isEssential: { type: Boolean, default: false },
}, { _id: false });

const packingTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['system', 'user', 'seasonal', 'destination'],
    default: 'system'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Matching criteria
  tripCategory: { type: String, default: null }, // hiking, business, etc.
  season: { type: String, enum: ['spring', 'summer', 'autumn', 'winter', null], default: null },
  climate: { type: String, enum: ['tropical', 'arid', 'temperate', 'cold', 'polar', null], default: null },
  destination: { type: String, default: null }, // country or region
  durationRange: { min: { type: Number, default: 1 }, max: { type: Number, default: 30 } },
  items: [templateItemSchema],
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

packingTemplateSchema.index({ type: 1, tripCategory: 1, season: 1 });
packingTemplateSchema.index({ createdBy: 1 });

const PackingTemplate = mongoose.model('PackingTemplate', packingTemplateSchema);
module.exports = PackingTemplate;
