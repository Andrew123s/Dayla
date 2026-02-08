const express = require('express');
const {
  register,
  login,
  logout,
  checkAuth,
  getMe,
  updateProfile,
  uploadAvatar,
  changePassword,
  deactivateAccount,
  completeOnboarding,
  verifyEmail,
  resendVerification,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, userSchemas } = require('../utils/validator');
const { uploadConfigs, handleMulterError, validateUploads } = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.post('/register', (req, res, next) => {
  const validation = validate(userSchemas.register, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  req.body = validation.value;
  next();
}, register);

router.post('/login', (req, res, next) => {
  const validation = validate(userSchemas.login, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  req.body = validation.value;
  next();
}, login);

// Email verification routes (public)
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/check', checkAuth); // Check auth status and get user
router.post('/logout', logout); // Logout and clear cookie
router.get('/me', getMe);
router.get('/friends', getFriends);
router.post('/friend-request/:userId', sendFriendRequest);
router.post('/friend-request/:userId/accept', acceptFriendRequest);

router.put('/me', (req, res, next) => {
  const validation = validate(userSchemas.updateProfile, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  req.body = validation.value;
  next();
}, updateProfile);

router.put('/change-password', (req, res, next) => {
  const validation = validate(userSchemas.changePassword, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  req.body = validation.value;
  next();
}, changePassword);

router.delete('/deactivate', deactivateAccount);

router.post('/complete-onboarding', completeOnboarding);

// Avatar upload
router.post('/upload-avatar',
  uploadConfigs.single('avatar'),
  handleMulterError,
  validateUploads,
  uploadAvatar
);

module.exports = router;