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
const pkg = require('./package.json');

// Captured once at boot so /version reports when this process actually started
// (useful for spotting a deploy that silently fell back to an older build).
const BOOT_TIME = new Date().toISOString();

// Import routes
const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const budgetRoutes = require('./routes/budget.routes');
const chatRoutes = require('./routes/chat.routes');
const uploadRoutes = require('./routes/upload.routes');
const communityRoutes = require('./routes/community.routes');
const boardRoutes = require('./routes/board.routes');
const climatiqRoutes = require('./routes/climatiq.routes');
const weatherRoutes = require('./routes/weather.routes');
const packingRoutes = require('./routes/packing.routes');
// Piko (Trails) is parked — to be developed separately and re-integrated later.

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

// General API rate limit — high enough for normal SPA use (background polling,
// note saves, dashboard init) while still blocking abusive scripts.
// OPTIONS preflight requests are skipped: they double-count every CORS call.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  skip: (req) => req.method === 'OPTIONS',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: 'Too many requests. Please try again in 15 minutes.' });
  },
});
app.use('/api/', limiter);

// Strict limiter on login and register only — prevents brute-force attacks
// without affecting any other route.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: (req) => req.method === 'OPTIONS',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: 'Too many login attempts. Please wait 15 minutes and try again.' });
  },
});

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

// Version / build-info endpoint.
//
// Makes a stale or half-applied deploy self-evident: hit GET /version and
// compare `commit` to the latest commit on GitHub. Render injects RENDER_GIT_*
// automatically. `features.budget` is hard-coded true *in this build* — so if
// the deployed /version reports it (or exists at all), you know the budget
// routes shipped. An older build that predates the budget feature returns the
// catch-all 404 for /version, which is itself the signal.
app.get('/version', (req, res) => {
  res.status(200).json({
    success: true,
    service: pkg.name || 'dayla-backend',
    version: pkg.version || '0.0.0',
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'unknown',
    branch: process.env.RENDER_GIT_BRANCH || process.env.GIT_BRANCH || 'unknown',
    node: process.version,
    environment: process.env.NODE_ENV || 'development',
    bootedAt: BOOT_TIME,
    uptimeSeconds: Math.round(process.uptime()),
    features: {
      // Present only because this build includes the budget routes/controller.
      budget: true
    }
  });
});

// API routes
// Strict rate limit on login and register only (brute-force protection)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips', budgetRoutes);
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