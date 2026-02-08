const express = require('express');
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addCollaborator,
  removeCollaborator,
  createStickyNote,
  updateStickyNote,
  deleteStickyNote,
  getTripAnalytics,
  getVisitedPlaces
} = require('../controllers/trip.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, tripSchemas } = require('../utils/validator');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get visited places (completed trips)
router.get('/visited', getVisitedPlaces);

// Trip CRUD routes
router.route('/')
  .get(getTrips)
  .post((req, res, next) => {
    const validation = validate(tripSchemas.createTrip, req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    req.body = validation.value;
    next();
  }, createTrip);

router.route('/:id')
  .get(getTrip)
  .put((req, res, next) => {
    const validation = validate(tripSchemas.updateTrip, req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    req.body = validation.value;
    next();
  }, updateTrip)
  .delete(deleteTrip);

// Collaborator management
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);

// Sticky note management
router.post('/:id/notes', (req, res, next) => {
  const validation = validate(tripSchemas.createStickyNote, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  req.body = validation.value;
  next();
}, createStickyNote);

router.put('/:id/notes/:noteId', (req, res, next) => {
  const validation = validate(tripSchemas.updateStickyNote, req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  req.body = validation.value;
  next();
}, updateStickyNote);

router.delete('/:id/notes/:noteId', deleteStickyNote);

// Analytics
router.get('/:id/analytics', getTripAnalytics);

module.exports = router;