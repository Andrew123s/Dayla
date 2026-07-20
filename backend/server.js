const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { initializeSocket } = require('./services/socket.service');
const { connectDB } = require('./config/db.config');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io — CORS uses the SAME origin logic as the REST API
// (config/cors.config.js). The old separate exact-string list meant a
// FRONTEND_URL trailing slash or www mismatch rejected every socket
// handshake while HTTP kept working, killing real-time notifications.
const { corsOrigin } = require('./config/cors.config');

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible in routes/controllers
app.set('io', io);

// Initialize socket service
initializeSocket(io);

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Drop legacy non-sparse unique indexes on Dashboard subdocument fields.
    // These were created when dashboard.model.js had unique:true on notes.id and
    // invitations.id. A non-sparse unique index rejects any second dashboard
    // that has an empty array (null value in the index), which broke trip creation.
    try {
      const mongoose = require('mongoose');
      const col = mongoose.connection.db.collection('dashboards');
      for (const idx of ['notes.id_1', 'invitations.id_1']) {
        await col.dropIndex(idx).catch(() => {}); // no-op if already gone
      }
    } catch (_) { /* index cleanup is best-effort */ }

    // Legacy accounts predate email-verification enforcement: they have
    // emailVerified false/absent but no verification token (they never went
    // through the flow). Now that verification is enforced at login, they'd
    // be locked out asking to "confirm" an email that was never sent. Mark
    // them verified once; genuinely-unverified new signups keep their token
    // and stay blocked until they click the link. Idempotent + best-effort.
    require('./models/user.model')
      .updateMany(
        { emailVerified: { $ne: true }, emailVerificationToken: { $exists: false } },
        { $set: { emailVerified: true } }
      )
      .then((r) => {
        if (r.modifiedCount > 0) {
          logger.info(`✉️ Marked ${r.modifiedCount} legacy accounts email-verified`);
        }
      })
      .catch((err) => logger.error('Legacy verification migration failed (non-fatal):', err));

    // Self-populate the Piko curated trail catalogue on a fresh database.
    // Best-effort + non-blocking: an empty catalogue means the Trails feature
    // shows "0 routes", so seed it once; no-op when routes already exist.
    require('./scripts/seed-routes')
      .ensureCuratedRoutes()
      .then((n) => { if (n > 0) logger.info(`🥾 Seeded ${n} curated Piko routes`); })
      .catch((err) => logger.error('Curated route seed failed (non-fatal):', err));

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
