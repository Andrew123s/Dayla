const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Import configurations
require('dotenv').config();
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const chatRoutes = require('./routes/chat.routes');
const uploadRoutes = require('./routes/upload.routes');
const communityRoutes = require('./routes/community.routes');
const boardRoutes = require('./routes/board.routes');
const climatiqRoutes = require('./routes/climatiq.routes');
const weatherRoutes = require('./routes/weather.routes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin); // Debug log

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // Alternative frontend port
      'http://localhost:3002',  // Backend port (for testing)
      'http://127.0.0.1:5173',  // Alternative localhost
      'http://127.0.0.1:3000',  // Alternative localhost
      'http://127.0.0.1:3002',  // Backend port (for testing)
      process.env.FRONTEND_URL
    ].filter(Boolean);

    console.log('Allowed origins:', allowedOrigins);

    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }

    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Development mode - allowing all origins');
      return callback(null, true);
    }

    console.log('❌ Origin blocked:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/climatiq', climatiqRoutes);
app.use('/api/weather', weatherRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;