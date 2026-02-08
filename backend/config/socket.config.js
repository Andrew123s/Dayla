const config = require('./env.config');

const socketConfig = {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: {
    name: 'io',
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
  },
};

module.exports = socketConfig;