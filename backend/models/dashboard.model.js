const mongoose = require('mongoose');

// Sticky Note Schema
const stickyNoteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'voice', 'weather', 'schedule', 'budget', 'sustainability'],
    required: true
  },
  x: {
    type: Number,
    required: true,
    min: 0
  },
  y: {
    type: Number,
    required: true,
    min: 0
  },
  width: {
    type: Number,
    required: true,
    min: 60
  },
  height: {
    type: Number,
    required: true,
    min: 60
  },
  content: {
    type: String,
    required: true,
    maxlength: [10000, 'Content cannot exceed 10,000 characters']
  },
  color: {
    type: String,
    default: '#faedcd'
  },
  emoji: {
    type: String,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
  },
  linkTo: {
    type: String,
    ref: 'StickyNote'
  },
  audioUrl: String,
  metadata: mongoose.Schema.Types.Mixed,
  scheduledDate: Date,
  scale: {
    type: Number,
    default: 1,
    min: 0.1,
    max: 5
  },
  crop: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 }
  }
}, { _id: false });

// Active User Schema
const activeUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: String,
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  currentNote: String, // ID of note they're editing
  cursorPosition: {
    x: Number,
    y: Number
  }
}, { _id: false });

// Invitation Schema
const invitationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Dashboard Schema
const dashboardSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: [100, 'Dashboard name cannot exceed 100 characters']
  },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'editor'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [stickyNoteSchema],
  activeUsers: [activeUserSchema],
  invitations: [invitationSchema],
  settings: {
    backgroundColor: {
      type: String,
      default: '#f7f3ee'
    },
    gridSize: {
      type: Number,
      default: 20,
      min: 10,
      max: 50
    },
    snapToGrid: {
      type: Boolean,
      default: true
    },
    showLinks: {
      type: Boolean,
      default: true
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
dashboardSchema.index({ tripId: 1 });
dashboardSchema.index({ owner: 1 });
dashboardSchema.index({ 'collaborators.user': 1 });
dashboardSchema.index({ isPublic: 1 });
dashboardSchema.index({ lastModified: -1 });

// Virtual for collaborator count
dashboardSchema.virtual('collaboratorCount').get(function() {
  return this.collaborators.length;
});

// Virtual for active user count
dashboardSchema.virtual('activeUserCount').get(function() {
  return this.activeUsers.length;
});

// Method to add collaborator
dashboardSchema.methods.addCollaborator = function(userId, role = 'editor') {
  if (!this.collaborators.some(c => c.user.toString() === userId.toString())) {
    this.collaborators.push({
      user: userId,
      role,
      joinedAt: new Date()
    });
    return true;
  }
  return false;
};

// Method to remove collaborator
dashboardSchema.methods.removeCollaborator = function(userId) {
  const index = this.collaborators.findIndex(c => c.user.toString() === userId.toString());
  if (index > -1) {
    this.collaborators.splice(index, 1);
    return true;
  }
  return false;
};

// Method to add active user
dashboardSchema.methods.addActiveUser = function(user) {
  const existingIndex = this.activeUsers.findIndex(u => u.userId.toString() === user.userId.toString());
  if (existingIndex > -1) {
    this.activeUsers[existingIndex].lastActive = new Date();
    this.activeUsers[existingIndex].currentNote = user.currentNote;
    this.activeUsers[existingIndex].cursorPosition = user.cursorPosition;
  } else {
    this.activeUsers.push({
      ...user,
      joinedAt: new Date(),
      lastActive: new Date()
    });
  }
  return this.save();
};

// Method to remove active user
dashboardSchema.methods.removeActiveUser = function(userId) {
  this.activeUsers = this.activeUsers.filter(u => u.userId.toString() !== userId.toString());
  return this.save();
};

// Method to create invitation
dashboardSchema.methods.createInvitation = function(email, invitedBy) {
  const invitation = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    invitedBy,
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  };
  this.invitations.push(invitation);
  return invitation;
};

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = Dashboard;