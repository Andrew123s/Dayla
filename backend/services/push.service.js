/**
 * Push notifications via Firebase Cloud Messaging (firebase-admin).
 *
 * Config: set ONE of
 *   - FIREBASE_SERVICE_ACCOUNT       (the service-account JSON, as a string)
 *   - FIREBASE_SERVICE_ACCOUNT_PATH  (path to the JSON file)
 * (Firebase console → Project settings → Service accounts → Generate new
 * private key.) When neither is set, every send is a silent no-op, so the
 * backend runs unchanged without Firebase.
 *
 * Complements the Socket.io `notification:new` events: sockets cover the open
 * app; FCM reaches devices when the app is backgrounded or closed.
 */
const logger = require('../utils/logger');

let messaging = null;
let initError = null;

function init() {
  if (messaging) return messaging;
  try {
    let credentialJson = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      // Render/console pastes sometimes wrap the JSON in quotes.
      if (raw.startsWith("'") || raw.startsWith('"')) raw = raw.slice(1, -1);
      credentialJson = JSON.parse(raw);
      // A pasted key can arrive with literal \n sequences instead of newlines.
      if (credentialJson.private_key && !credentialJson.private_key.includes('\n')) {
        credentialJson.private_key = credentialJson.private_key.replace(/\\n/g, '\n');
      }
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      credentialJson = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    }
    if (!credentialJson) {
      initError = 'FIREBASE_SERVICE_ACCOUNT env var is not set';
      return null;
    }
    if (!credentialJson.private_key || !credentialJson.client_email) {
      // The most common mix-up: pasting google-services.json (the CLIENT
      // config) instead of a service-account key.
      initError =
        'FIREBASE_SERVICE_ACCOUNT is not a service-account key (missing ' +
        'private_key/client_email — this looks like google-services.json). ' +
        'Generate one: Firebase console → Project settings → Service ' +
        'accounts → Generate new private key, and paste that JSON.';
      return null;
    }

    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(credentialJson) });
    }
    messaging = admin.messaging();
    initError = null;
    logger.info('Push notifications enabled (firebase-admin initialized)');
    return messaging;
  } catch (error) {
    initError = error.message;
    logger.warn(`Push notifications disabled: ${error.message}`);
    return null;
  }
}

const isConfigured = () => !!init();
// Why push is disabled (for /version diagnostics); null when healthy.
const configError = () => { init(); return initError; };

/**
 * Send a push to all of a user's devices. Best-effort: failures are logged,
 * never thrown. Invalid/expired tokens are pruned from the user document.
 *
 * @param {string|Object} userId  Recipient user id
 * @param {{title: string, body: string, data?: Object}} payload
 */
async function sendToUser(userId, { title, body, data = {} }) {
  const m = init();
  if (!m || !userId) return;

  try {
    const User = require('../models/user.model');
    const user = await User.findById(userId).select('+pushTokens');
    const tokens = (user && user.pushTokens) || [];
    if (!tokens.length) return;

    const response = await m.sendEachForMulticast({
      tokens,
      notification: { title, body },
      // Data values must be strings for FCM.
      data: Object.fromEntries(
        Object.entries(data)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });

    // Prune tokens FCM says are dead so we stop paying for them.
    const dead = [];
    response.responses.forEach((r, i) => {
      const code = r.error && r.error.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token' ||
        code === 'messaging/invalid-argument'
      ) {
        dead.push(tokens[i]);
      }
    });
    if (dead.length) {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushTokens: { $in: dead } },
      });
    }
  } catch (error) {
    logger.warn(`Push to user ${userId} failed: ${error.message}`);
  }
}

module.exports = { isConfigured, configError, sendToUser };
