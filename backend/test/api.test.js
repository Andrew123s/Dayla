const request = require('supertest');
const app = require('../app');
const { connectDB } = require('../config/db.config');
const User = require('../models/user.model');

describe('Dayla Backend API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({ email: /test@/ });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    };

    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should login user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});