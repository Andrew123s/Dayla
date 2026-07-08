const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  interests: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each interest cannot be more than 50 characters']
  }],
  location: {
    type: String,
    trim: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // FCM device tokens for push notifications (mobile apps). A user can have
  // several devices; invalid tokens are pruned by push.service.js on send.
  pushTokens: [{
    type: String,
    select: false
  }],
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  ecoScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },

  // ── Billing snapshot ──────────────────────────────────────────────────────
  // Denormalized copy of the user's current plan so permission checks (which run
  // on every request via `protect`) need no extra query. The Subscription
  // collection is the source-of-truth ledger; webhooks keep this in sync.
  subscriptionType: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'trialing', 'past_due', 'canceled', 'inactive'],
    default: 'inactive'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual', null],
    default: null
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  currentPeriodStart: {
    type: Date,
    default: null
  },
  currentPeriodEnd: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ name: 'text', bio: 'text' });
userSchema.index({ interests: 1 });

// Virtual for full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    interests: this.interests,
    location: this.location,
    ecoScore: this.ecoScore,
    badges: this.badges,
    friendCount: (this.friends || []).length,
    notificationsEnabled: this.notificationsEnabled,
    createdAt: this.createdAt,
    subscription: this.subscriptionSnapshot
  };
});

// Compact subscription snapshot for the frontend (no Stripe ids leaked).
userSchema.virtual('subscriptionSnapshot').get(function() {
  return {
    type: this.subscriptionType || 'free',
    status: this.subscriptionStatus || 'inactive',
    billingCycle: this.billingCycle || null,
    cancelAtPeriodEnd: !!this.cancelAtPeriodEnd,
    currentPeriodEnd: this.currentPeriodEnd || null
  };
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
