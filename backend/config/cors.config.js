// Single source of truth for CORS origins — used by BOTH the Express REST
// middleware (app.js) and the Socket.io server (server.js).
//
// Why: notifications silently died in production because the socket handshake
// used a stricter, separate origin list than REST. A trailing slash or a
// www/non-www mismatch in FRONTEND_URL let HTTP calls through while every
// WebSocket connection was rejected — so `notification:new` never arrived.

// Normalize FRONTEND_URL: trim + strip trailing slashes, and accept both the
// www and non-www variants of the same host.
const raw = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
const bare = raw.replace('://www.', '://');
const frontendVariants = raw ? [raw, bare, bare.replace('://', '://www.')] : [];

const allowedOrigins = [
  ...new Set(
    [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3002',
      ...frontendVariants,
    ].filter(Boolean)
  ),
];

// Shared origin check: same-origin/no-origin requests pass, the allowlist
// passes, and anything goes outside production (local dev, emulators).
function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  if (process.env.NODE_ENV !== 'production') return callback(null, true);
  return callback(new Error('Not allowed by CORS'));
}

module.exports = { allowedOrigins, corsOrigin };
