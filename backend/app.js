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
const pikoRoutes = require('./routes/piko.routes');
const billingRoutes = require('./routes/billing.routes');
const memoryRoutes = require('./routes/memory.routes');
const compassRoutes = require('./routes/compass.routes');
const billingController = require('./controllers/billing.controller');

// Create Express app
const app = express();

// Shared origin logic (also used by the Socket.io server in server.js) so
// REST and WebSocket connections can never drift apart again.
const { corsOrigin } = require('./config/cors.config');

// CORS must be before helmet so preflight OPTIONS requests aren't blocked
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Security middleware (after CORS so preflight isn't blocked)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Stripe webhook — MUST be registered BEFORE the JSON body parser and the rate
// limiter. Signature verification needs the raw request bytes (express.json
// would consume them), and Stripe retries aggressively (the general limiter
// would drop legitimate retries). Unauthenticated by design — Stripe is not a
// logged-in user; the handler verifies the signature instead.
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingController.handleWebhook);

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
      budget: true,
      // Env-dependent integrations — false here means the env var is missing
      // on this deployment, not that the code is absent.
      push: require('./services/push.service').isConfigured(),
      // Why push is off (bad JSON paste, missing var, …); null when healthy.
      pushError: require('./services/push.service').configError(),
      email: !!process.env.RESEND_API_KEY,
      emailVerification:
        process.env.EMAIL_VERIFICATION_REQUIRED === 'true' ||
        (process.env.EMAIL_VERIFICATION_REQUIRED !== 'false' && !!process.env.RESEND_API_KEY)
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
app.use('/api/piko', pikoRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/compass', compassRoutes);

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