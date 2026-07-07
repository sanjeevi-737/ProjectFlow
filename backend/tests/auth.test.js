import request from 'supertest';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, generateRefreshToken } from './setup.js';

let app;

beforeAll(async () => {
  await setupTestDB();
  const module = await import('../src/server.js');
  app = module.default;
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New User', email: 'new@example.com', password: 'Password123' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'new@example.com');
    });

    it('should reject duplicate email', async () => {
      await createTestUser({ email: 'dup@example.com' });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Dup User', email: 'dup@example.com', password: 'Password123' });
      expect(res.status).toBe(409);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Weak', email: 'weak@example.com', password: '123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser({ email: 'login@example.com', password: 'TestPass123' });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'TestPass123' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid password', async () => {
      await createTestUser({ email: 'wrong@example.com', password: 'TestPass123' });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'WrongPass123' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh access token', async () => {
      const user = await createTestUser();
      const refreshToken = generateRefreshToken(user._id);
      user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
      await user.save();

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });
  });
});
