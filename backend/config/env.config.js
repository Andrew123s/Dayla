const Joi = require('joi');

// Environment variables validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),

  // Database
  MONGO_URI: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default('7d'),

  // Frontend
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),

  // File Upload
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  // Google Gemini AI
  GOOGLE_AI_API_KEY: Joi.string().required(),

  // Email (Resend)
  EMAIL_FROM: Joi.string().default('onboarding@resend.dev'),
  RESEND_API_KEY: Joi.string().optional(),

  // External APIs
  WEATHER_API_KEY: Joi.string().optional(),
  MAPS_API_KEY: Joi.string().optional(),

}).unknown(true);

// Validate environment variables
const { error, value } = envSchema.validate(process.env);

if (error) {
  console.error('❌ Environment validation error:', error.details[0].message);
  process.exit(1);
}

const config = {
  env: value.NODE_ENV,
  port: value.PORT,
  mongoUri: value.MONGO_URI,
  jwt: {
    secret: value.JWT_SECRET,
    expire: value.JWT_EXPIRE,
  },
  frontendUrl: value.FRONTEND_URL,
  cloudinary: {
    cloudName: value.CLOUDINARY_CLOUD_NAME,
    apiKey: value.CLOUDINARY_API_KEY,
    apiSecret: value.CLOUDINARY_API_SECRET,
  },
  googleAI: {
    apiKey: value.GOOGLE_AI_API_KEY,
  },
  email: {
    from: value.EMAIL_FROM,
    resendApiKey: value.RESEND_API_KEY,
  },
  apis: {
    weather: value.WEATHER_API_KEY,
    maps: value.MAPS_API_KEY,
  },
};

module.exports = config;