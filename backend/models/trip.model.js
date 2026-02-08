const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Trip name is required'],
    maxlength: [100, 'Trip name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StickyNote'
  }],
  destination: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    country: String,
    region: String
  },
  dates: {
    startDate: Date,
    endDate: Date
  },
  budget: {
    total: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    categories: {
      accommodation: Number,
      transportation: Number,
      food: Number,
      activities: Number,
      other: Number
    }
  },
  status: {
    type: String,
    enum: ['planning', 'booked', 'in_progress', 'completed', 'cancelled'],
    default: 'planning'
  },
  tags: [{
    type: String,
    enum: ['adventure', 'relaxation', 'cultural', 'nature', 'city', 'beach', 'mountain', 'road_trip']
  }],
  category: {
    type: String,
    enum: ['hiking', 'business', 'family', 'camping', 'exploring', 'beach', 'road_trip', 'cultural', 'other'],
    default: null
  },
  ecoScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  carbonFootprint: {
    total: Number,
    unit: {
      type: String,
      default: 'kg CO2'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  coverImage: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tripSchema.index({ owner: 1, createdAt: -1 });
tripSchema.index({ collaborators: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ isPublic: 1 });
tripSchema.index({ 'destination.name': 'text', name: 'text', description: 'text' });

// Virtual for duration
tripSchema.virtual('duration').get(function() {
  if (this.dates.startDate && this.dates.endDate) {
    const diffTime = Math.abs(this.dates.endDate - this.dates.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for collaborator count
tripSchema.virtual('collaboratorCount').get(function() {
  return this.collaborators.length;
});

// Virtual for progress percentage
tripSchema.virtual('progress').get(function() {
  let completed = 0;
  let total = 3; // Basic progress metrics

  if (this.destination.name) completed++;
  if (this.dates.startDate && this.dates.endDate) completed++;
  if (this.budget.total > 0) completed++;

  return Math.round((completed / total) * 100);
});

// Method to add collaborator
tripSchema.methods.addCollaborator = function(userId) {
  if (!this.collaborators.includes(userId)) {
    this.collaborators.push(userId);
    return this.save();
  }
  return this;
};

// Method to remove collaborator
tripSchema.methods.removeCollaborator = function(userId) {
  this.collaborators = this.collaborators.filter(
    id => id.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update budget
tripSchema.methods.updateBudget = function(budgetData) {
  this.budget = { ...this.budget, ...budgetData };
  return this.save();
};

// Method to calculate eco score
tripSchema.methods.calculateEcoScore = async function() {
  // This would integrate with the eco utils
  // For now, return a basic calculation
  this.ecoScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
  return this.save();
};

// Static method to get public trips
tripSchema.statics.getPublicTrips = function(limit = 10) {
  return this.find({ isPublic: true })
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get trending trips
tripSchema.statics.getTrending = function(limit = 10) {
  return this.find({ isPublic: true })
    .populate('owner', 'name avatar')
    .sort({ 'collaborators.1': -1, createdAt: -1 }) // Sort by collaborator count
    .limit(limit);
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;