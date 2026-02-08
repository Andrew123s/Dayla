const {
  calculateTransportEmissions,
  calculateAccommodationEmissions,
  calculateActivityEmissions,
  calculateFoodEmissions,
  calculateTripEmissions,
  calculateRealTimeEmissions,
  validateClimatiqConnection,
} = require('../services/climatiq.service');
const logger = require('../utils/logger');

// @desc    Validate Climatiq API connection
// @route   GET /api/climatiq/validate
// @access  Public
const validateConnection = async (req, res) => {
  try {
    const connected = await validateClimatiqConnection();
    
    res.status(200).json({
      success: true,
      connected,
      message: connected 
        ? 'Climatiq API is connected and operational' 
        : 'Climatiq API connection failed, using fallback calculations'
    });
  } catch (error) {
    logger.error('Climatiq validation error:', error);
    res.status(200).json({
      success: true,
      connected: false,
      message: 'Using fallback emission calculations'
    });
  }
};

// @desc    Calculate transport emissions
// @route   POST /api/climatiq/transport
// @access  Private
const calculateTransport = async (req, res) => {
  try {
    const { mode, distance, passengers, fuel_type, cabin_class } = req.body;

    if (!mode || !distance) {
      return res.status(400).json({
        success: false,
        message: 'Mode and distance are required'
      });
    }

    const emissions = await calculateTransportEmissions({
      mode,
      distance,
      passengers,
      fuel_type,
      cabin_class,
    });

    res.status(200).json({
      success: true,
      data: {
        emissions,
        unit: 'kg CO2e',
        mode,
        distance,
      }
    });
  } catch (error) {
    logger.error('Calculate transport emissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate transport emissions',
      error: error.message
    });
  }
};

// @desc    Calculate accommodation emissions
// @route   POST /api/climatiq/accommodation
// @access  Private
const calculateAccommodation = async (req, res) => {
  try {
    const { type, nights, country, star_rating } = req.body;

    if (!type || !nights || !country) {
      return res.status(400).json({
        success: false,
        message: 'Type, nights, and country are required'
      });
    }

    const emissions = await calculateAccommodationEmissions({
      type,
      nights,
      country,
      star_rating,
    });

    res.status(200).json({
      success: true,
      data: {
        emissions,
        unit: 'kg CO2e',
        type,
        nights,
      }
    });
  } catch (error) {
    logger.error('Calculate accommodation emissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate accommodation emissions',
      error: error.message
    });
  }
};

// @desc    Calculate food emissions
// @route   POST /api/climatiq/food
// @access  Private
const calculateFood = async (req, res) => {
  try {
    const { meal_type, country_code, number_of_meals } = req.body;

    if (!meal_type || !country_code || !number_of_meals) {
      return res.status(400).json({
        success: false,
        message: 'Meal type, country code, and number of meals are required'
      });
    }

    const emissions = await calculateFoodEmissions({
      meal_type,
      country_code,
      number_of_meals,
    });

    res.status(200).json({
      success: true,
      data: {
        emissions,
        unit: 'kg CO2e',
        meal_type,
        number_of_meals,
      }
    });
  } catch (error) {
    logger.error('Calculate food emissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate food emissions',
      error: error.message
    });
  }
};

// @desc    Calculate total trip emissions
// @route   POST /api/climatiq/trip
// @access  Private
const calculateTrip = async (req, res) => {
  try {
    const { transport, accommodation, activities, food } = req.body;

    const result = await calculateTripEmissions(
      transport || [],
      accommodation || [],
      activities || [],
      food || []
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Calculate trip emissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate trip emissions',
      error: error.message
    });
  }
};

// @desc    Calculate real-time emissions for planning
// @route   POST /api/climatiq/realtime
// @access  Private
const calculateRealtime = async (req, res) => {
  try {
    const tripData = req.body;

    if (!tripData.destination || !tripData.duration) {
      return res.status(400).json({
        success: false,
        message: 'Destination and duration are required'
      });
    }

    const result = await calculateRealTimeEmissions(tripData);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Calculate real-time emissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate real-time emissions',
      error: error.message
    });
  }
};

module.exports = {
  validateConnection,
  calculateTransport,
  calculateAccommodation,
  calculateFood,
  calculateTrip,
  calculateRealtime,
};
