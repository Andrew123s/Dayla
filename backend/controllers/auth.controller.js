const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/env.config');
const logger = require('../utils/logger');
const { sendConfirmationEmail, generateVerificationToken } = require('../services/email.service');
const { uploadFile, getOptimizedImageUrl, validateFile } = require('../services/cloud.service');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

// Cookie options for secure token storage
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-domain cookies in production
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

// Set auth token cookie
const setTokenCookie = (res, token) => {
  res.cookie('auth_token', token, getCookieOptions());
};

// Clear auth token cookie
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('auth_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('Registration request received:', { name: req.body.name, email: req.body.email });
    const { name, email, password, bio, interests } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with verification token
    const user = await User.create({
      name,
      email,
      password,
      bio,
      interests: interests || [],
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Build confirmation URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    // Send confirmation email
    try {
      await sendConfirmationEmail(user.email, user.name, confirmationUrl);
      logger.info(`Confirmation email sent to ${user.email}`);
    } catch (emailError) {
      logger.error('Failed to send confirmation email:', emailError);
      // Continue with registration even if email fails
    }

    logger.info(`New user registered: ${user.email} - awaiting email verification`);

    // DO NOT issue JWT token until email is verified
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account before logging in.',
      requiresVerification: true,
      data: {
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Update last active
    await user.updateLastActive();

    // Generate token
    const token = generateToken(user._id);

    // Return user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      interests: user.interests,
      ecoScore: user.ecoScore,
      badges: user.badges,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted
    };

    logger.info(`User logged in: ${user.email}`);

    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last active
    await user.updateLastActive();

    res.status(200).json({
      success: true,
      data: {
        user: user.profile
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, interests, location } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;
    if (location !== undefined) updateData.location = location;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Profile updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.profile
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// @desc    Deactivate account
// @route   DELETE /api/auth/deactivate
// @access  Private
const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Account deactivated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
      error: error.message
    });
  }
};

// @desc    Complete onboarding
// @route   POST /api/auth/complete-onboarding
// @access  Private
const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { onboardingCompleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Onboarding completed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        user: user.profile
      }
    });
  } catch (error) {
    logger.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`Email verified for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save({ validateBeforeSave: false });

    // Build confirmation URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    // Send confirmation email
    await sendConfirmationEmail(user.email, user.name, confirmationUrl);

    logger.info(`Verification email resent to ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear the auth cookie
    clearTokenCookie(res);

    logger.info('User logged out');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// @desc    Refresh token / Check auth status
// @route   GET /api/auth/check
// @access  Private
const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      interests: user.interests,
      ecoScore: user.ecoScore,
      badges: user.badges,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted
    };

    res.status(200).json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    logger.error('Check auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Auth check failed',
      error: error.message
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file provided'
      });
    }

    const file = req.file;

    // Validate file
    const validation = validateFile(file, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'], 5 * 1024 * 1024);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(', ')
      });
    }

    // Upload to cloud storage
    const uploadResult = await uploadFile(file.buffer, {
      folder: 'dayla/avatars',
      public_id: `avatar_${req.user._id}_${Date.now()}`,
      resource_type: 'image'
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload avatar'
      });
    }

    // Use the secure_url directly from upload result instead of generating optimized URL
    const avatarUrl = uploadResult.url;

    // Update user's avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Avatar updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    logger.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

// @desc    Get user's friends
// @route   GET /api/auth/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email avatar bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        friends: user.friends,
        count: user.friends.length
      }
    });

  } catch (error) {
    logger.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friends',
      error: error.message
    });
  }
};

// @desc    Send friend request
// @route   POST /api/auth/friend-request/:userId
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(req.user._id);

    // Check if already friends
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already friends with this user'
      });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === currentUser._id.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Add friend request to target user
    targetUser.friendRequests.push({
      from: currentUser._id,
      status: 'pending',
      createdAt: new Date()
    });

    await targetUser.save();

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('friend:request_sent', {
        fromUser: {
          _id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar,
          email: req.user.email
        },
        toUserId: userId,
        timestamp: new Date()
      });
      logger.info(`Friend request sent: ${req.user.email} → ${targetUser.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully',
      data: { requestSent: true }
    });

  } catch (error) {
    logger.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request',
      error: error.message
    });
  }
};

// @desc    Accept friend request
// @route   POST /api/auth/friend-request/:userId/accept
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.user._id);
    const requestUser = await User.findById(userId);

    if (!requestUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the pending friend request
    const friendRequest = currentUser.friendRequests.find(
      req => req.from.toString() === userId && req.status === 'pending'
    );

    if (!friendRequest) {
      return res.status(400).json({
        success: false,
        message: 'No pending friend request from this user'
      });
    }

    // Add to friends list
    currentUser.friends.push(userId);
    requestUser.friends.push(req.user._id);

    // Update request status to accepted
    friendRequest.status = 'accepted';

    await currentUser.save();
    await requestUser.save();

    // Emit WebSocket events
    const io = req.app.get('io');
    if (io) {
      io.emit('friend:request_accepted', {
        acceptedBy: {
          _id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar
        },
        requestFrom: {
          _id: requestUser._id,
          name: requestUser.name,
          avatar: requestUser.avatar
        },
        timestamp: new Date()
      });
      
      io.emit('chat:enabled', {
        user1: req.user._id,
        user2: userId,
        timestamp: new Date()
      });
      
      logger.info(`Friend request accepted: ${requestUser.email} ↔ ${req.user.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'Friend request accepted',
      data: { 
        friend: {
          _id: requestUser._id,
          name: requestUser.name,
          avatar: requestUser.avatar,
          email: requestUser.email
        }
      }
    });

  } catch (error) {
    logger.error('Accept friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept friend request',
      error: error.message
    });
  }
};

module.exports = {
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
};