const logger = require('../utils/logger');

// Configuration
const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY || 'MMTJR3DHYX08F71T3R0X21JAEG';
const CLIMATIQ_BASE_URL = 'https://api.climatiq.io';
// Use "^0" to always match the latest data version (the old "22.22" is obsolete)
const CLIMATIQ_DATA_VERSION = '^0';

// Cache for emission factors and calculations
const emissionCache = new Map();
const CACHE_TTL = 86400000; // 24 hours in milliseconds

// Helper function to make Climatiq API requests
async function makeClimatiqRequest(endpoint, data) {
  const url = `${CLIMATIQ_BASE_URL}${endpoint}`;
  const cacheKey = `${endpoint}-${JSON.stringify(data)}`;

  // Check cache
  const cachedData = emissionCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data;
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Climatiq API error (${response.status}):`, errorText);
      throw new Error(`Climatiq API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Cache the result
    emissionCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    logger.error('Failed to fetch from Climatiq API:', error);
    throw error;
  }
}

// Calculate transport emissions
async function calculateTransportEmissions(request) {
  try {
    let activityId = '';

    switch (request.mode) {
      case 'flight':
        activityId = 'passenger_flight-route_type_domestic-aircraft_type_na-distance_na-class_economy';
        break;
      case 'train':
        activityId = 'passenger_train-route_type_national_rail-fuel_source_na';
        break;
      case 'bus':
        activityId = 'passenger_vehicle-vehicle_type_bus-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na';
        break;
      case 'car':
        activityId = request.fuel_type === 'electric'
          ? 'passenger_vehicle-vehicle_type_car-fuel_source_bev-engine_size_na-vehicle_age_na-vehicle_weight_na'
          : 'passenger_vehicle-vehicle_type_car-fuel_source_petrol-engine_size_na-vehicle_age_na-vehicle_weight_na';
        break;
      default:
        throw new Error(`Unsupported transport mode: ${request.mode}`);
    }

    const calculationRequest = {
      emission_factor: { 
        activity_id: activityId, 
        data_version: CLIMATIQ_DATA_VERSION 
      },
      parameters: {
        passengers: request.passengers || 1,
        distance: request.distance,
        distance_unit: 'km',
      },
    };

    const response = await makeClimatiqRequest('/data/v1/estimate', calculationRequest);
    return response.co2e; // Returns kg CO2e
  } catch (error) {
    logger.error('Error calculating transport emissions:', error);
    return getFallbackTransportEmission(request);
  }
}

// Calculate accommodation emissions
async function calculateAccommodationEmissions(request) {
  try {
    const calculationRequest = {
      emission_factor: {
        activity_id: `accommodation_type_hotel-country_${request.country.toUpperCase()}`,
        data_version: CLIMATIQ_DATA_VERSION,
      },
      parameters: {
        number_of_nights: request.nights,
        number_of_rooms: 1,
      },
    };

    const response = await makeClimatiqRequest('/data/v1/estimate', calculationRequest);
    return response.co2e;
  } catch (error) {
    logger.warn(`Country-specific accommodation factor for ${request.country} not available. Using fallback.`);
    return getFallbackAccommodationEmission(request);
  }
}

// Calculate activity emissions
async function calculateActivityEmissions(request) {
  logger.warn('Activity emissions are estimates as Climatiq lacks specific factors for granular activities.');
  return getFallbackActivityEmission(request);
}

// Calculate food emissions
async function calculateFoodEmissions(request) {
  try {
    let activity_id;
    
    switch (request.meal_type) {
      case 'vegan':
        activity_id = `meal-type_vegan-country_${request.country_code.toUpperCase()}`;
        break;
      case 'vegetarian':
        activity_id = `meal-type_vegetarian-country_${request.country_code.toUpperCase()}`;
        break;
      case 'meat_heavy':
        activity_id = `meal-type_meat_daily-country_${request.country_code.toUpperCase()}`;
        break;
      case 'average_meal':
      default:
        activity_id = `meal-type_average-country_${request.country_code.toUpperCase()}`;
        break;
    }

    const calculationRequest = {
      emission_factor: {
        activity_id,
        data_version: CLIMATIQ_DATA_VERSION,
      },
      parameters: {
        number_of_meals: request.number_of_meals,
      },
    };

    const response = await makeClimatiqRequest('/data/v1/estimate', calculationRequest);
    return response.co2e;
  } catch (error) {
    logger.warn(`Food emission factor for ${request.meal_type} not available. Using fallback.`);
    return getFallbackFoodEmission(request);
  }
}

// Fallback emission calculations
function getFallbackTransportEmission(request) {
  const factors = { 
    flight: 0.255, 
    train: 0.041, 
    bus: 0.089, 
    car: 0.171, 
    ferry: 0.113 
  };
  return request.distance * (factors[request.mode] || 0.1) * (request.passengers || 1);
}

function getFallbackAccommodationEmission(request) {
  const factors = { 
    hotel: 25, 
    hostel: 12, 
    vacation_rental: 18, 
    camping: 2 
  };
  return request.nights * (factors[request.type] || 18);
}

function getFallbackActivityEmission(request) {
  const factors = { default: 5 };
  return (factors[request.type.toLowerCase()] || factors.default) * request.participants;
}

function getFallbackFoodEmission(request) {
  const factors = {
    vegan: 0.7,
    vegetarian: 1.0,
    local_produce: 1.2,
    meat_heavy: 3.5,
    average_meal: 1.8,
  };
  return (factors[request.meal_type] || factors.average_meal) * request.number_of_meals;
}

// Calculate total trip emissions
async function calculateTripEmissions(transport, accommodation, activities, food) {
  try {
    // Calculate all emissions in parallel
    const [transportEmissions, accommodationEmissions, activityEmissions, foodEmissions] = await Promise.all([
      Promise.all(transport.map(async (req) => ({
        mode: req.mode,
        emissions: await calculateTransportEmissions(req),
      }))),
      Promise.all(accommodation.map(async (req) => ({
        type: req.type,
        emissions: await calculateAccommodationEmissions(req),
      }))),
      Promise.all(activities.map(async (req) => ({
        type: req.type,
        emissions: await calculateActivityEmissions(req),
      }))),
      Promise.all(food.map(async (req) => ({
        meal_type: req.meal_type,
        emissions: await calculateFoodEmissions(req),
      }))),
    ]);

    const totalTransport = transportEmissions.reduce((sum, item) => sum + item.emissions, 0);
    const totalAccommodation = accommodationEmissions.reduce((sum, item) => sum + item.emissions, 0);
    const totalActivities = activityEmissions.reduce((sum, item) => sum + item.emissions, 0);
    const totalFood = foodEmissions.reduce((sum, item) => sum + item.emissions, 0);

    return {
      transport: totalTransport,
      accommodation: totalAccommodation,
      activities: totalActivities,
      food: totalFood,
      total: totalTransport + totalAccommodation + totalActivities + totalFood,
      breakdown: {
        transport_details: transportEmissions,
        accommodation_details: accommodationEmissions,
        activity_details: activityEmissions,
        food_details: foodEmissions,
      },
    };
  } catch (error) {
    logger.error('Error calculating trip emissions:', error);
    throw error;
  }
}

// Real-time emission calculation for planning board
async function calculateRealTimeEmissions(tripData) {
  try {
    const transportRequest = {
      mode: tripData.transport_mode,
      distance: tripData.distance,
      passengers: 1,
    };

    const accommodationRequest = {
      type: tripData.accommodation_type,
      nights: tripData.duration,
      country: tripData.destination,
    };

    const activityRequests = tripData.activities.map((activity) => ({
      type: activity,
      duration: 4,
      participants: 1,
      country: tripData.destination,
    }));

    const foodRequests = tripData.food_types.map((foodType) => ({
      meal_type: foodType,
      country_code: tripData.destination,
      number_of_meals: 1,
    }));

    const result = await calculateTripEmissions(
      [transportRequest],
      [accommodationRequest],
      activityRequests,
      foodRequests,
    );

    const averageTripEmissions = tripData.duration * 50;
    const comparison = ((result.total - averageTripEmissions) / averageTripEmissions) * 100;

    const recommendations = [];
    if (result.transport > result.total * 0.6) {
      recommendations.push('Consider train or bus instead of flying to reduce transport emissions by up to 90%');
    }
    if (result.accommodation > 30 * tripData.duration) {
      recommendations.push('Choose eco-certified accommodation to reduce lodging emissions by 20-40%');
    }
    if (result.activities > 20) {
      recommendations.push('Select low-impact activities like hiking or cycling to minimize activity emissions');
    }
    if (result.food > result.total * 0.2) {
      recommendations.push('Reduce meat-heavy meals and choose more plant-based options to lower food emissions');
    }

    return {
      total_emissions: result.total,
      emissions_per_day: result.total / tripData.duration,
      comparison_to_average: comparison,
      recommendations,
    };
  } catch (error) {
    logger.error('Error calculating real-time emissions:', error);
    return {
      total_emissions: tripData.duration * 40,
      emissions_per_day: 40,
      comparison_to_average: 0,
      recommendations: [
        'Unable to calculate precise emissions. Consider choosing sustainable transport, accommodation, and food options.',
      ],
    };
  }
}

// Validate API connection
async function validateClimatiqConnection() {
  try {
    const testRequest = {
      emission_factor: { 
        activity_id: 'electricity-energy_source_grid_mix', 
        data_version: CLIMATIQ_DATA_VERSION 
      },
      parameters: { 
        energy: 1, 
        energy_unit: 'kWh' 
      },
    };
    
    await makeClimatiqRequest('/data/v1/estimate', testRequest);
    return true;
  } catch (error) {
    logger.error('Climatiq connection validation failed:', error);
    return false;
  }
}

module.exports = {
  calculateTransportEmissions,
  calculateAccommodationEmissions,
  calculateActivityEmissions,
  calculateFoodEmissions,
  calculateTripEmissions,
  calculateRealTimeEmissions,
  validateClimatiqConnection,
};
