const mongoose = require('mongoose');

// Comment Schema
const commentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    id: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Tag Schema
const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['activity', 'location', 'season', 'difficulty', 'duration'],
    required: true
  }
}, { _id: false });

// Post Schema
const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    alt: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    name: {
      type: String,
      required: true,
      maxlength: [100, 'Location name cannot exceed 100 characters']
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String
  },
  tags: [tagSchema],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  saves: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  ecoImpact: {
    carbonFootprint: Number,
    waterUsage: Number,
    score: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  editedAt: Date,
  featured: {
    type: Boolean,
    default: false
  },
  featuredAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'location.name': 'text', content: 'text', title: 'text' });
postSchema.index({ tags: 1 });
postSchema.index({ visibility: 1, isPublished: 1 });
postSchema.index({ featured: 1, createdAt: -1 });
postSchema.index({ tripId: 1 });
postSchema.index({ views: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Virtual for engagement score
postSchema.virtual('engagementScore').get(function() {
  return this.likes.length * 1 + this.comments.length * 2 + this.shares.length * 3 + this.views * 0.1;
});

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.likes.some(like => like.user.toString() === userId.toString())) {
    this.likes.push({ user: userId, createdAt: new Date() });
    return this.save();
  }
  return this;
};

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

// Method to add comment
postSchema.methods.addComment = function(commentData) {
  const comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    author: commentData.author,
    content: commentData.content,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  this.comments.push(comment);
  return this.save();
};

// Method to add view
postSchema.methods.addView = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to get trending posts
postSchema.statics.getTrending = function(limit = 10, timeframe = 7) {
  const dateThreshold = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        isPublished: true,
        visibility: 'public',
        createdAt: { $gte: dateThreshold }
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: [{ $size: '$likes' }, 1] },
            { $multiply: [{ $size: '$comments' }, 2] },
            { $multiply: [{ $size: '$shares' }, 3] },
            { $multiply: ['$views', 0.1] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' }
  ]);
};

// Pre-save middleware to set publishedAt
postSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (this.isModified() && this.isPublished) {
    this.editedAt = new Date();
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;