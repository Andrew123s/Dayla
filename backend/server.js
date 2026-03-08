const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { initializeSocket } = require('./services/socket.service');
const { connectDB } = require('./config/db.config');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const socketOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: socketOrigins,
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
