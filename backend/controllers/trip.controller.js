const Trip = require('../models/trip.model');
const Dashboard = require('../models/dashboard.model');
const logger = require('../utils/logger');

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { name, description, dates } = req.body;

    // Create trip
    const trip = await Trip.create({
      name,
      description,
      owner: req.user._id,
      dates
    });

    // Create default dashboard for the trip
    const dashboard = await Dashboard.create({
      tripId: trip._id,
      name: `${name} Dashboard`,
      owner: req.user._id,
      collaborators: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    logger.info(`Trip created: ${trip.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: {
        trip,
        dashboard
      }
    });
  } catch (error) {
    logger.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trip',
      error: error.message
    });
  }
};

// @desc    Get all trips for user
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    })
    .populate('owner', 'name avatar')
    .populate('collaborators', 'name avatar')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        trips,
        count: trips.length
      }
    });
  } catch (error) {
    logger.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trips',
      error: error.message
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('owner', 'name avatar bio')
      .populate('collaborators', 'name avatar')
      .populate('items');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user has access
    const hasAccess = trip.owner._id.toString() === req.user._id.toString() ||
                      trip.collaborators.some(c => c._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this trip'
      });
    }

    res.status(200).json({
      success: true,
      data: { trip }
    });
  } catch (error) {
    logger.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trip',
      error: error.message
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is owner
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name avatar');

    logger.info(`Trip updated: ${updatedTrip.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: { trip: updatedTrip }
    });
  } catch (error) {
    logger.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trip',
      error: error.message
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is owner
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this trip'
      });
    }

    // Delete associated dashboard
    await Dashboard.findOneAndDelete({ tripId: req.params.id });

    // Delete trip
    await Trip.findByIdAndDelete(req.params.id);

    logger.info(`Trip deleted: ${trip.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    logger.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trip',
      error: error.message
    });
  }
};

// @desc    Add collaborator to trip
// @route   POST /api/trips/:id/collaborators
// @access  Private
const addCollaborator = async (req, res) => {
  try {
    const { userId, role = 'editor' } = req.body;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is owner
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add collaborators'
      });
    }

    // Check if user is already a collaborator
    if (trip.collaborators.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a collaborator'
      });
    }

    trip.collaborators.push(userId);
    await trip.save();

    // Add to dashboard as well
    await Dashboard.findOneAndUpdate(
      { tripId: req.params.id },
      {
        $push: {
          collaborators: {
            user: userId,
            role,
            joinedAt: new Date()
          }
        }
      }
    );

    const updatedTrip = await Trip.findById(req.params.id)
      .populate('collaborators', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Collaborator added successfully',
      data: { trip: updatedTrip }
    });
  } catch (error) {
    logger.error('Add collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add collaborator',
      error: error.message
    });
  }
};

// @desc    Remove collaborator from trip
// @route   DELETE /api/trips/:id/collaborators/:userId
// @access  Private
const removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user is owner
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove collaborators'
      });
    }

    trip.collaborators = trip.collaborators.filter(
      id => id.toString() !== userId
    );
    await trip.save();

    // Remove from dashboard as well
    await Dashboard.findOneAndUpdate(
      { tripId: req.params.id },
      {
        $pull: {
          collaborators: { user: userId }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully'
    });
  } catch (error) {
    logger.error('Remove collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove collaborator',
      error: error.message
    });
  }
};

// @desc    Create sticky note
// @route   POST /api/trips/:id/notes
// @access  Private
const createStickyNote = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ tripId: req.params.id });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Check permissions
    const collaborator = dashboard.collaborators.find(
      c => c.user.toString() === req.user._id.toString()
    );

    if (!collaborator || collaborator.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create notes'
      });
    }

    const noteData = {
      id: Math.random().toString(36).substr(2, 9),
      ...req.body
    };

    dashboard.notes.push(noteData);
    dashboard.lastModified = new Date();
    await dashboard.save();

    res.status(201).json({
      success: true,
      message: 'Sticky note created successfully',
      data: { note: noteData }
    });
  } catch (error) {
    logger.error('Create sticky note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sticky note',
      error: error.message
    });
  }
};

// @desc    Update sticky note
// @route   PUT /api/trips/:id/notes/:noteId
// @access  Private
const updateStickyNote = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ tripId: req.params.id });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Check permissions
    const collaborator = dashboard.collaborators.find(
      c => c.user.toString() === req.user._id.toString()
    );

    if (!collaborator || collaborator.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update notes'
      });
    }

    const noteIndex = dashboard.notes.findIndex(
      note => note.id === req.params.noteId
    );

    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    dashboard.notes[noteIndex] = {
      ...dashboard.notes[noteIndex],
      ...req.body
    };
    dashboard.lastModified = new Date();
    await dashboard.save();

    res.status(200).json({
      success: true,
      message: 'Sticky note updated successfully',
      data: { note: dashboard.notes[noteIndex] }
    });
  } catch (error) {
    logger.error('Update sticky note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sticky note',
      error: error.message
    });
  }
};

// @desc    Delete sticky note
// @route   DELETE /api/trips/:id/notes/:noteId
// @access  Private
const deleteStickyNote = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ tripId: req.params.id });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Check permissions
    const collaborator = dashboard.collaborators.find(
      c => c.user.toString() === req.user._id.toString()
    );

    if (!collaborator || collaborator.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete notes'
      });
    }

    dashboard.notes = dashboard.notes.filter(
      note => note.id !== req.params.noteId
    );
    dashboard.lastModified = new Date();
    await dashboard.save();

    res.status(200).json({
      success: true,
      message: 'Sticky note deleted successfully'
    });
  } catch (error) {
    logger.error('Delete sticky note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sticky note',
      error: error.message
    });
  }
};

// @desc    Get trip analytics
// @route   GET /api/trips/:id/analytics
// @access  Private
const getTripAnalytics = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ tripId: req.params.id });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Check permissions
    const hasAccess = dashboard.collaborators.some(
      c => c.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics'
      });
    }

    const analytics = {
      noteCount: dashboard.notes.length,
      activeUsers: dashboard.activeUsers.length,
      collaboratorCount: dashboard.collaborators.length,
      lastModified: dashboard.lastModified,
      noteTypes: dashboard.notes.reduce((acc, note) => {
        acc[note.type] = (acc[note.type] || 0) + 1;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Get trip analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trip analytics',
      error: error.message
    });
  }
};

// @desc    Get visited places (completed trips)
// @route   GET /api/trips/visited
// @access  Private
const getVisitedPlaces = async (req, res) => {
  try {
    // Find all trips where user is owner or collaborator and trip is completed
    const trips = await Trip.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ],
      status: 'completed'
    })
    .select('name dates coverImage destination')
    .sort({ 'dates.end': -1 })
    .limit(20);

    // Transform to visited places format
    const places = trips.map(trip => ({
      id: trip._id,
      name: trip.destination || trip.name,
      date: trip.dates?.end || trip.dates?.start || new Date(),
      image: trip.coverImage || null
    }));

    res.status(200).json({
      success: true,
      data: { places }
    });
  } catch (error) {
    logger.error('Get visited places error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get visited places',
      error: error.message
    });
  }
};

module.exports = {
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
};