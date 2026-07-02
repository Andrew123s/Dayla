const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// Route model — Piko trails (curated + user-generated).
//
// GeoJSON `geometry` (LineString) drives the map/elevation; `startPoint` (Point,
// 2dsphere) powers maps + "near me". Engagement (savedBy, votes, comments) is
// GLOBAL popularity — the group-scoped decision lives on the Dashboard. A
// `toClient(userId)` projection hides raw id arrays and returns the viewer's own
// saved/vote state, matching the Piko frontend `Route` shape.
// ─────────────────────────────────────────────────────────────────────────────

const commentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, default: 'Anonymous' },
    content: { type: String, required: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, enum: [-1, 1], required: true },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    // Stable human id for curated routes (e.g. "morskie-oko"); UGC uses _id.
    slug: { type: String, index: true, unique: true, sparse: true },
    type: { type: String, enum: ['curated', 'user_generated'], default: 'user_generated' },
    title: { type: String, required: true, maxlength: 160 },
    country: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], default: 'moderate' },
    distanceKm: { type: Number, default: 0 },
    elevationGainM: { type: Number, default: 0 },
    estimatedDurationMins: { type: Number, default: 0 },
    photos: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    ecoScore: { type: Number, default: 75 },
    weatherScore: { type: Number, default: 70 },
    accessibilityScore: { type: Number, default: 50 },
    ecoImpact: {
      transportMode: { type: String, default: '' },
      co2EstimateKg: { type: Number, default: 0 },
      greenerAlternatives: { type: [String], default: [] },
    },
    geometry: {
      type: { type: String, enum: ['LineString'], default: 'LineString' },
      coordinates: { type: [[Number]], default: undefined }, // [[lng, lat, ele?], …]
    },
    startPoint: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creatorName: { type: String, default: 'Dayla' },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    votes: { type: [voteSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    moderation: {
      status: { type: String, enum: ['approved', 'pending', 'flagged', 'removed'], default: 'approved' },
      reports: {
        type: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: String,
            createdAt: { type: Date, default: Date.now },
          },
        ],
        default: [],
      },
    },
  },
  { timestamps: true }
);

routeSchema.index({ startPoint: '2dsphere' });
routeSchema.index({ country: 1, difficulty: 1 });
routeSchema.index({ 'moderation.status': 1 });

// Viewer-facing projection — matches the Piko frontend `Route` type.
routeSchema.methods.toClient = function toClient(userId) {
  const uid = userId ? userId.toString() : null;
  const votes = this.votes || [];
  const userVote = uid ? votes.find((v) => v.user && v.user.toString() === uid)?.value ?? 0 : 0;
  const voteScore = votes.reduce((sum, v) => sum + (v.value || 0), 0);
  const isSaved = uid ? (this.savedBy || []).some((u) => u.toString() === uid) : false;
  const hasGeo = this.geometry && Array.isArray(this.geometry.coordinates) && this.geometry.coordinates.length > 1;
  const hasStart = this.startPoint && Array.isArray(this.startPoint.coordinates) && this.startPoint.coordinates.length === 2;

  return {
    id: this.slug || this._id.toString(),
    _id: this._id.toString(),
    type: this.type,
    title: this.title,
    country: this.country,
    location: this.location,
    description: this.description,
    difficulty: this.difficulty,
    distanceKm: this.distanceKm,
    elevationGainM: this.elevationGainM,
    estimatedDurationMins: this.estimatedDurationMins,
    photos: this.photos || [],
    tags: this.tags || [],
    ecoScore: this.ecoScore,
    weatherScore: this.weatherScore,
    accessibilityScore: this.accessibilityScore,
    ecoImpact: this.ecoImpact,
    geometry: hasGeo ? { type: 'LineString', coordinates: this.geometry.coordinates } : undefined,
    startPoint: hasStart ? this.startPoint.coordinates : null,
    creatorName: this.creatorName,
    moderationStatus: this.moderation ? this.moderation.status : 'approved',
    isSaved,
    saveCount: (this.savedBy || []).length,
    voteScore,
    userVote,
    commentCount: (this.comments || []).length,
  };
};

module.exports = mongoose.model('Route', routeSchema);
