const mongoose = require('mongoose');

// Attachment Schema
const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'gif', 'sticker'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  mimeType: String,
  size: Number,
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // for audio/video
    pages: Number // for documents
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Reaction Schema
const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Message Schema
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    maxlength: [5000, 'Message content cannot exceed 5000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'gif', 'sticker', 'system'],
    default: 'text'
  },
  attachments: [attachmentSchema],
  reactions: [reactionSchema],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: mongoose.Schema.Types.Mixed,
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ tripId: 1 });
messageSchema.index({ 'reactions.user': 1 });

// Virtual for delivery status
messageSchema.virtual('deliveryStatus').get(function() {
  const totalParticipants = this.conversation?.participants?.length || 0;
  const deliveredCount = this.deliveredTo.length;
  const readCount = this.readBy.length;

  if (readCount === totalParticipants) return 'read';
  if (deliveredCount === totalParticipants) return 'delivered';
  if (deliveredCount > 0) return 'sent';
  return 'sending';
});

// Virtual for reaction summary
messageSchema.virtual('reactionSummary').get(function() {
  const summary = {};
  this.reactions.forEach(reaction => {
    if (!summary[reaction.emoji]) {
      summary[reaction.emoji] = { count: 0, users: [] };
    }
    summary[reaction.emoji].count++;
    summary[reaction.emoji].users.push(reaction.user);
  });
  return summary;
});

// Method to add reaction
messageSchema.methods.addReaction = function(emoji, userId) {
  // Remove existing reaction from same user
  this.reactions = this.reactions.filter(r => !(r.emoji === emoji && r.user.toString() === userId.toString()));

  // Add new reaction
  this.reactions.push({
    emoji,
    user: userId,
    createdAt: new Date()
  });

  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(emoji, userId) {
  this.reactions = this.reactions.filter(r =>
    !(r.emoji === emoji && r.user.toString() === userId.toString())
  );
  return this.save();
};

// Method to mark as delivered
messageSchema.methods.markAsDelivered = function(userId) {
  if (!this.deliveredTo.some(d => d.user.toString() === userId.toString())) {
    this.deliveredTo.push({
      user: userId,
      deliveredAt: new Date()
    });
  }
  return this.save();
};

// Method to mark as read
messageSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.some(r => r.user.toString() === userId.toString())) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
  return this.save();
};

// Method to edit message
messageSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.edited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to delete message
messageSchema.methods.softDelete = function() {
  this.deleted = true;
  this.deletedAt = new Date();
  this.content = 'This message was deleted';
  return this.save();
};

// Pre-save middleware to update conversation's last message
messageSchema.post('save', async function() {
  try {
    const Conversation = mongoose.model('Conversation');
    await Conversation.findByIdAndUpdate(this.conversation, {
      lastMessage: this._id,
      $inc: { messageCount: 1 },
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;