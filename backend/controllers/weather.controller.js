const config = require('../config/env.config');
const logger = require('../utils/logger');

const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

/**
 * Map WeatherAPI condition codes to simplified conditions
 */
const mapCondition = (code, isDay) => {
  // Thunder
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'Stormy';
  // Rain / drizzle / sleet
  if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) return 'Rainy';
  // Snow / blizzard / ice
  if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(code)) return 'Cloudy';
  // Cloudy / overcast / fog / mist
  if ([1006, 1009, 1030, 1135, 1147].includes(code)) return 'Cloudy';
  // Partly cloudy
  if ([1003].includes(code)) return 'Cloudy';
  // Windy conditions are not directly a WeatherAPI code — we derive from wind speed
  // Clear / Sunny
  return 'Sunny';
};

/**
 * Pick an emoji icon based on condition
 */
const conditionEmoji = (condition) => {
  switch (condition) {
    case 'Sunny': return '☀️';
    case 'Cloudy': return '⛅';
    case 'Rainy': return '🌧️';
    case 'Windy': return '💨';
    case 'Stormy': return '⛈️';
    default: return '🌤️';
  }
};

// @desc    Get current weather + forecast for a location
// @route   GET /api/weather?location=CityName&days=5
// @access  Private
const getWeather = async (req, res) => {
  try {
    const apiKey = config.apis.weather;
    if (!apiKey || apiKey === 'your_weather_api_key') {
      return res.status(503).json({
        success: false,
        message: 'Weather API key is not configured'
      });
    }

    const location = req.query.location || 'Accra';
    const days = Math.min(parseInt(req.query.days) || 5, 10); // WeatherAPI free allows up to 3-day forecast, paid up to 10

    // Fetch forecast (includes current weather)
    const url = `${WEATHER_API_BASE}/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=${days}&aqi=no&alerts=yes`;

    logger.info(`Fetching weather for "${location}" (${days} days)`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`WeatherAPI error ${response.status}: ${errorBody}`);
      return res.status(response.status === 401 ? 401 : 502).json({
        success: false,
        message: response.status === 401
          ? 'Invalid Weather API key'
          : 'Failed to fetch weather data from provider'
      });
    }

    const data = await response.json();

    // Build current weather
    const current = {
      location: `${data.location.name}, ${data.location.country}`,
      region: data.location.region,
      temp_c: Math.round(data.current.temp_c),
      temp_f: Math.round(data.current.temp_f),
      feelslike_c: Math.round(data.current.feelslike_c),
      feelslike_f: Math.round(data.current.feelslike_f),
      condition: mapCondition(data.current.condition.code, data.current.is_day),
      conditionText: data.current.condition.text,
      icon: conditionEmoji(mapCondition(data.current.condition.code, data.current.is_day)),
      humidity: data.current.humidity,
      wind_kph: Math.round(data.current.wind_kph),
      wind_mph: Math.round(data.current.wind_mph),
      uv: data.current.uv,
      is_day: data.current.is_day,
    };

    // If wind is very high, override condition to Windy
    if (data.current.wind_kph > 40) {
      current.condition = 'Windy';
      current.icon = conditionEmoji('Windy');
    }

    // Build forecast days
    const forecast = data.forecast.forecastday.map((day) => {
      let condition = mapCondition(day.day.condition.code, true);
      // Override to Windy if max wind is high
      if (day.day.maxwind_kph > 40) condition = 'Windy';

      return {
        date: day.date,
        dayName: new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        temp_c: Math.round(day.day.avgtemp_c),
        temp_f: Math.round(day.day.avgtemp_f),
        maxtemp_c: Math.round(day.day.maxtemp_c),
        maxtemp_f: Math.round(day.day.maxtemp_f),
        mintemp_c: Math.round(day.day.mintemp_c),
        mintemp_f: Math.round(day.day.mintemp_f),
        condition,
        conditionText: day.day.condition.text,
        icon: conditionEmoji(condition),
        chance_of_rain: day.day.daily_chance_of_rain,
        maxwind_kph: Math.round(day.day.maxwind_kph),
        humidity: day.day.avghumidity,
        uv: day.day.uv,
      };
    });

    // Build weather alerts
    const alerts = (data.alerts?.alert || []).map((a) => ({
      headline: a.headline,
      severity: a.severity?.toLowerCase() === 'severe' || a.severity?.toLowerCase() === 'extreme' ? 'critical' : a.severity?.toLowerCase() === 'moderate' ? 'warning' : 'info',
      event: a.event,
      description: a.desc?.substring(0, 200),
    }));

    // Generate a simple activity suggestion based on current weather
    let suggestion = '';
    if (current.condition === 'Sunny' && current.temp_c >= 20 && current.temp_c <= 35) {
      suggestion = 'Perfect conditions for outdoor activities and hiking!';
    } else if (current.condition === 'Sunny' && current.temp_c > 35) {
      suggestion = 'Very hot — stay hydrated and seek shade during peak hours.';
    } else if (current.condition === 'Rainy') {
      suggestion = 'Rain expected — pack waterproof gear and consider indoor activities.';
    } else if (current.condition === 'Stormy') {
      suggestion = 'Storms in the area — stay indoors and avoid exposed trails.';
    } else if (current.condition === 'Windy') {
      suggestion = 'Strong winds — avoid high-altitude trails and secure camping gear.';
    } else if (current.condition === 'Cloudy') {
      suggestion = 'Overcast skies — great for comfortable outdoor exploration.';
    } else if (current.temp_c < 10) {
      suggestion = 'Cold weather — dress in layers and bring warm gear.';
    } else {
      suggestion = 'Good conditions for exploring. Enjoy your adventure!';
    }

    res.status(200).json({
      success: true,
      data: {
        current,
        forecast,
        alerts,
        suggestion,
      }
    });
  } catch (error) {
    logger.error('Weather controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message
    });
  }
};

module.exports = {
  getWeather,
};
