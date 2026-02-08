const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: [100, 'Conversation name cannot exceed 100 characters']
  },
  description: String,
  isGroup: {
    type: Boolean,
    default: false
  },
  participants: [participantSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    muteNotifications: {
      type: Boolean,
      default: false
    }
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  inviteCodeExpires: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ createdBy: 1 });
conversationSchema.index({ isGroup: 1 });
conversationSchema.index({ tripId: 1 });
conversationSchema.index({ updatedAt: -1 });

// Virtual for participant count
conversationSchema.virtual('participantCount').get(function() {
  return this.participants && Array.isArray(this.participants) ? this.participants.length : 0;
});

// Virtual for unread messages for a specific user
conversationSchema.methods.getUnreadCount = function(userId) {
  // This would need to be calculated based on lastReadAt vs message timestamps
  // Implementation depends on your message model structure
  return 0; // Placeholder
};

// Method to add participant
conversationSchema.methods.addParticipant = function(userId, role = 'member') {
  if (!this.participants) this.participants = [];
  if (!this.participants.some(p => p.user && p.user.toString() === userId.toString())) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date(),
      lastReadAt: new Date()
    });
    return true;
  }
  return false;
};

// Method to remove participant
conversationSchema.methods.removeParticipant = function(userId) {
  const index = this.participants.findIndex(p => p.user.toString() === userId.toString());
  if (index > -1) {
    this.participants.splice(index, 1);
    return true;
  }
  return false;
};

// Method to update last read
conversationSchema.methods.markAsRead = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastReadAt = new Date();
    return this.save();
  }
  return false;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
