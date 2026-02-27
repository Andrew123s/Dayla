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
const packingRoutes = require('./routes/packing.routes');

// Create Express app
const app = express();

// Build allowed origins list once
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3002',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS must be before helmet so preflight OPTIONS requests aren't blocked
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Security middleware (after CORS so preflight isn't blocked)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

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
app.use('/api/packing', packingRoutes);

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