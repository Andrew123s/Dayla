const express = require('express');
const {
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
} = require('../controllers/community.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { validate, communitySchemas } = require('../utils/validator');

const router = express.Router();

// Public routes (optional auth for viewing)
router.get('/trending', optionalAuth, getTrendingPosts);
router.get('/location/:location', optionalAuth, getPostsByLocation);

// Protected routes (require authentication)
router.use(protect);

// Post CRUD
router.route('/posts')
  .get(getPosts)
  .post((req, res, next) => {
    const validation = validate(communitySchemas.createPost, req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    req.body = validation.value;
    next();
  }, createPost);

router.route('/posts/:id')
  .get(getPost)
  .put((req, res, next) => {
    const validation = validate(communitySchemas.updatePost, req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    req.body = validation.value;
    next();
  }, updatePost)
  .delete(deletePost);

// User posts
router.get('/users/:userId/posts', getUserPosts);

// Likes
router.post('/posts/:id/likes', (req, res, next) => {
  const validation = validate(communitySchemas.addLike, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  req.body = validation.value;
  next();
}, addLike);

router.delete('/posts/:id/likes', removeLike);

// Saved posts
router.get('/saved', getSavedPosts);
router.post('/posts/:id/save', saveTrip);

// Comments
router.post('/posts/:id/comments', (req, res, next) => {
  const validation = validate(communitySchemas.addComment, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    req.body = validation.value;
    next();
  }, addComment);

router.put('/posts/:postId/comments/:commentId', updateComment);
router.delete('/posts/:postId/comments/:commentId', deleteComment);

module.exports = router;