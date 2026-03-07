const Post = require('../models/post.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const logger = require('../utils/logger');

// @desc    Create post
// @route   POST /api/community/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    console.log('Create post request body:', JSON.stringify(req.body, null, 2));
    
    const postData = {
      ...req.body,
      author: req.user._id
    };

    const post = await Post.create(postData);

    await post.populate('author', 'name avatar email');

    logger.info(`Post created by ${req.user.email}: ${post._id}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('post:created', {
        postId: post._id,
        author: {
          _id: post.author._id,
          name: post.author.name,
          avatar: post.author.avatar
        },
        content: post.content,
        location: post.location,
        timestamp: new Date()
      });
      logger.info(`Post creation event emitted: ${post._id}`);
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    logger.error('Create post error:', error);
    console.error('Create post error details:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post',
      error: error.message
    });
  }
};

// @desc    Get posts
// @route   GET /api/community/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'latest' } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { engagementScore: -1 };
    }

    const posts = await Post.find({
      isPublished: true,
      $or: [
        { visibility: 'public' },
        { visibility: 'friends', author: { $in: req.user.friends || [] } },
        { author: req.user._id }
      ]
    })
    .populate('author', 'name avatar bio')
    .populate('comments.author', 'name avatar')
    .populate('likes.user', 'name avatar')
    .populate('repostedFrom.author', 'name avatar')
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

    // Add `liked` and `saved` booleans relative to the current user
    const userId = req.user._id.toString();
    const enrichedPosts = posts.map(post => ({
      ...post,
      liked: (post.likes || []).some(like => (like.user?._id || like.user)?.toString() === userId),
      saved: (post.saves || []).some(save => (save.user?._id || save.user)?.toString() === userId),
      likeCount: (post.likes || []).length,
    }));

    const total = await Post.countDocuments({
      isPublished: true,
      $or: [
        { visibility: 'public' },
        { visibility: 'friends', author: { $in: req.user.friends || [] } },
        { author: req.user._id }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        posts: enrichedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts',
      error: error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/community/posts/:id
// @access  Private
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar bio interests')
      .populate('comments.author', 'name avatar')
      .populate('comments.replies.author', 'name avatar')
      .populate('likes.user', 'name avatar')
      .populate('shares.user', 'name avatar')
      .populate('saves.user', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check visibility permissions
    const canView = post.visibility === 'public' ||
                   post.author._id.toString() === req.user._id.toString() ||
                   (post.visibility === 'friends' && req.user.friends.includes(post.author._id));

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this post'
      });
    }

    // Increment view count
    await post.addView();

    res.status(200).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/community/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');

    logger.info(`Post updated: ${updatedPost._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/community/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    logger.info(`Post deleted: ${post._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

// @desc    Add/remove like
// @route   POST/DELETE /api/community/posts/:id/likes
// @access  Private
const addLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const hasLiked = post.likes.some(like => like.user.toString() === req.user._id.toString());

    if (hasLiked) {
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { likes: { user: req.user._id } }
      });
      const updated = await Post.findById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Like removed successfully',
        data: { liked: false, likeCount: (updated.likes || []).length }
      });
    } else {
      await Post.findByIdAndUpdate(req.params.id, {
        $push: { likes: { user: req.user._id, createdAt: new Date() } }
      });
      const updated = await Post.findById(req.params.id);
      const newLikeCount = (updated.likes || []).length;

      const postOwnerId = post.author._id || post.author;
      if (postOwnerId.toString() !== req.user._id.toString()) {
        try {
          await Notification.create({
            recipient: postOwnerId,
            sender: req.user._id,
            type: 'like',
            post: post._id,
            message: `${req.user.name} liked your post`
          });
        } catch (notifErr) {
          logger.error('Failed to create like notification:', notifErr);
        }
      }
      
      const io = req.app.get('io');
      if (io) {
        io.emit('post:liked', {
          postId: post._id,
          userId: req.user._id,
          userName: req.user.name,
          likeCount: newLikeCount,
          timestamp: new Date()
        });

        if (postOwnerId.toString() !== req.user._id.toString()) {
          io.emit('notification:new', {
            recipientId: postOwnerId.toString(),
            type: 'like',
            senderName: req.user.name,
            postId: post._id,
            timestamp: new Date()
          });
        }

        logger.info(`Post like event emitted: ${post._id} by ${req.user.email}`);
      }
      
      res.status(200).json({
        success: true,
        message: 'Post liked successfully',
        data: { liked: true, likeCount: newLikeCount }
      });
    }
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
};

const removeLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { likes: { user: req.user._id } }
    });

    res.status(200).json({
      success: true,
      message: 'Like removed successfully'
    });
  } catch (error) {
    logger.error('Remove like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove like',
      error: error.message
    });
  }
};

// @desc    Add comment
// @route   POST /api/community/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const comment = {
      id: commentId,
      author: req.user._id,
      content: req.body.content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment } },
      { new: true }
    );

    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.author', 'name avatar')
      .populate('comments.replies.author', 'name avatar');

    const postOwnerId = post.author._id || post.author;
    if (postOwnerId.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: postOwnerId,
          sender: req.user._id,
          type: 'comment',
          post: post._id,
          message: `${req.user.name} commented on your post`
        });
      } catch (notifErr) {
        logger.error('Failed to create comment notification:', notifErr);
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('comment:added', {
        postId: post._id,
        comment: updatedPost.comments[updatedPost.comments.length - 1],
        commentCount: updatedPost.comments.length,
        timestamp: new Date()
      });

      if (postOwnerId.toString() !== req.user._id.toString()) {
        io.emit('notification:new', {
          recipientId: postOwnerId.toString(),
          type: 'comment',
          senderName: req.user.name,
          postId: post._id,
          timestamp: new Date()
        });
      }

      logger.info(`Comment added event emitted: post ${post._id}`);
    }

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: addedComment,
        commentCount: updatedPost.comments.length
      }
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// @desc    Update comment
// @route   PUT /api/community/posts/:postId/comments/:commentId
// @access  Private
const updateComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = req.body.content;
    comment.updatedAt = new Date();

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully'
    });
  } catch (error) {
    logger.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/community/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.find(
      c => (c.id === req.params.commentId || (c._id && c._id.toString() === req.params.commentId))
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    const pullFilter = comment._id
      ? { _id: comment._id }
      : { id: req.params.commentId };

    const updated = await Post.findByIdAndUpdate(
      req.params.postId,
      { $pull: { comments: pullFilter } },
      { new: true }
    );

    const commentCount = updated ? updated.comments.length : 0;

    const io = req.app.get('io');
    if (io) {
      io.emit('comment:deleted', {
        postId: req.params.postId,
        commentId: req.params.commentId,
        commentCount,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: { commentCount }
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

// @desc    Get trending posts
// @route   GET /api/community/trending
// @access  Public (optional auth)
const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const posts = await Post.getTrending(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        posts,
        count: posts.length
      }
    });
  } catch (error) {
    logger.error('Get trending posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending posts',
      error: error.message
    });
  }
};

// @desc    Get posts by location
// @route   GET /api/community/location/:location
// @access  Public (optional auth)
const getPostsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      'location.name': new RegExp(location, 'i'),
      isPublished: true,
      visibility: 'public'
    })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      'location.name': new RegExp(location, 'i'),
      isPublished: true,
      visibility: 'public'
    });

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get posts by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts by location',
      error: error.message
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/community/users/:userId/posts
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      author: userId,
      isPublished: true,
      $or: [
        { visibility: 'public' },
        { visibility: 'friends', author: { $in: req.user.friends } },
        { author: req.user._id }
      ]
    })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      author: userId,
      isPublished: true,
      $or: [
        { visibility: 'public' },
        { visibility: 'friends', author: { $in: req.user.friends } },
        { author: req.user._id }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user posts',
      error: error.message
    });
  }
};

// @desc    Save/unsave trip from post
// @route   POST /api/community/posts/:id/save
// @access  Private
const saveTrip = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const hasSaved = post.saves.some(save => save.user.toString() === req.user._id.toString());

    if (hasSaved) {
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { saves: { user: req.user._id } }
      });
      const updated = await Post.findById(req.params.id);
      
      res.status(200).json({
        success: true,
        message: 'Trip unsaved successfully',
        data: { saved: false, saveCount: (updated.saves || []).length }
      });
    } else {
      await Post.findByIdAndUpdate(req.params.id, {
        $push: { saves: { user: req.user._id, createdAt: new Date() } }
      });
      const updated = await Post.findById(req.params.id);

      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.emit('trip:saved', {
          postId: post._id,
          userId: req.user._id,
          userName: req.user.name,
          saveCount: (updated.saves || []).length,
          timestamp: new Date()
        });
        logger.info(`Trip saved event emitted: post ${post._id} by ${req.user.email}`);
      }

      res.status(200).json({
        success: true,
        message: 'Trip saved successfully',
        data: { saved: true, saveCount: (updated.saves || []).length }
      });
    }
  } catch (error) {
    logger.error('Save trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save trip',
      error: error.message
    });
  }
};

// @desc    Get user's saved community posts
// @route   GET /api/community/saved
// @access  Private
const getSavedPosts = async (req, res) => {
  try {
    const savedPosts = await Post.find({
      'saves.user': req.user._id,
      isPublished: true
    })
    .populate('author', 'name avatar')
    .sort({ 'saves.createdAt': -1 });

    const formatted = savedPosts.map(post => {
      const saveEntry = post.saves.find(s => s.user.toString() === req.user._id.toString());
      return {
        id: post._id,
        title: post.title || '',
        content: post.content,
        location: post.location?.name || '',
        image: post.images?.[0]?.url || '',
        author: {
          id: post.author?._id || '',
          name: post.author?.name || 'Unknown',
          avatar: post.author?.avatar || '',
        },
        tags: (post.tags || []).map(t => t.name),
        savedAt: saveEntry?.createdAt || post.createdAt,
        tripId: post.tripId || null,
        likes: post.likes?.length || 0,
        comments: post.comments?.length || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: { posts: formatted, count: formatted.length }
    });
  } catch (error) {
    logger.error('Get saved posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved posts',
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  addLike,
  removeLike,
  addComment,
  updateComment,
  deleteComment,
  getTrendingPosts,
  getPostsByLocation,
  getUserPosts,
  saveTrip,
  getSavedPosts
};