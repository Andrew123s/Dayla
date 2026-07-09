const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// Mriz memory — a trip transformed into a shareable story. Assembled by
// memory.service.js when a trip completes; one memory per trip. Holds
// everything the story card (Phase 2) and route replay (Phase 3) need, so
// rendering never has to re-join trip/board/route data.
// ─────────────────────────────────────────────────────────────────────────────

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    // EXIF capture (Phase 1): when/where the photo was taken, when known.
    takenAt: { type: Date, default: null },
    coords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    caption: { type: String, default: '' },
  },
  { _id: false }
);

const memorySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      unique: true,
      index: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    status: {
      type: String,
      enum: ['processing', 'ready'],
      default: 'processing',
    },

    title: { type: String, default: '' },
    coverPhoto: { type: String, default: null },
    // Destination country — used by milestone comparisons (cross-border).
    country: { type: String, default: '' },
    // Trip eco score at completion — used by the "greenest yet" milestone.
    ecoScore: { type: Number, default: 0 },
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter'],
      required: true,
    },

    stats: {
      distanceKm: { type: Number, default: 0 },
      elevationGainM: { type: Number, default: 0 },
      days: { type: Number, default: 1 },
      companions: { type: Number, default: 0 },
    },

    // Derived, not user-entered: e.g. sunny, challenging, together, green.
    moodTags: { type: [String], default: [] },

    media: { type: [mediaSchema], default: [] },

    // Route replay data (Phase 3). [[lng, lat, ele?], …]
    routeGeometry: {
      type: { type: String, enum: ['LineString'], default: undefined },
      coordinates: { type: [[Number]], default: undefined },
    },

    // Weather snapshot captured at assembly (best effort; historical weather
    // isn't retro-fetchable, so this reflects conditions around trip end).
    weatherDays: [
      {
        date: Date,
        condition: String,
        tempC: Number,
        icon: String,
        _id: false,
      },
    ],

    // Phase 4: story-driven milestones ("first hike above 2,000 m").
    milestones: { type: [String], default: [] },
  },
  { timestamps: true }
);

memorySchema.index({ owner: 1, createdAt: -1 });
memorySchema.index({ participants: 1 });

module.exports = mongoose.model('Memory', memorySchema);
