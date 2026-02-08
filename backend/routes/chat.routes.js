const express = require('express');
const {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  sendMessage,
  getMessages,
  addReaction,
  removeReaction,
  markAsRead,
  deleteMessage,
  uploadGroupAvatar,
  generateInviteLink,
  joinViaInvite,
  addMembers
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, chatSchemas } = require('../utils/validator');
const { uploadConfigs, handleMulterError } = require('../middleware/upload.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Conversation routes
router.route('/conversations')
  .get(getConversations)
  .post((req, res, next) => {
    const validation = validate(chatSchemas.createConversation, req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    req.body = validation.value;
    next();
  }, createConversation);

router.route('/conversations/:id')
  .get(getConversation)
  .put(updateConversation)
  .delete(deleteConversation);

// Message routes
router.get('/conversations/:id/messages', getMessages);

router.post('/conversations/:id/messages', (req, res, next) => {
  const validation = validate(chatSchemas.sendMessage, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  req.body = validation.value;
  next();
}, sendMessage);

// Message reactions
router.post('/messages/:messageId/reactions', (req, res, next) => {
  const validation = validate(chatSchemas.addReaction, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    req.body = validation.value;
    next();
  }, addReaction);

router.delete('/messages/:messageId/reactions/:emoji', removeReaction);

// Message management
router.put('/conversations/:id/read', markAsRead);
router.delete('/messages/:id', deleteMessage);

// Group management
router.post('/conversations/:id/avatar', uploadConfigs.single('avatar'), handleMulterError, uploadGroupAvatar);
router.post('/conversations/:id/invite-link', generateInviteLink);
router.post('/conversations/:id/members', addMembers);
router.post('/join/:inviteCode', joinViaInvite);

module.exports = router;