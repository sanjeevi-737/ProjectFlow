import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestWorkspace, generateRefreshToken } from './setup.js';
import AuthService from '../src/services/AuthService.js';
import jwt from 'jsonwebtoken';
import config from '../src/config/index.js';

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

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      const result = await AuthService.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'Password123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('New User');
      expect(result.user.email).toBe('new@example.com');
      expect(result.verificationToken).toBeDefined();
    });

    it('should throw conflict for duplicate email', async () => {
      await createTestUser({ email: 'dup@example.com' });
      await expect(
        AuthService.register({ name: 'Dup', email: 'dup@example.com', password: 'Password123' })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const { user, verificationToken } = await AuthService.register({
        name: 'Verify Me',
        email: 'verify@example.com',
        password: 'Password123',
      });

      expect(user.isEmailVerified).toBe(false);
      const verified = await AuthService.verifyEmail(verificationToken);
      expect(verified.isEmailVerified).toBe(true);
    });

    it('should throw for invalid token', async () => {
      await expect(AuthService.verifyEmail('fake-token')).rejects.toThrow(
        'Invalid or expired verification token'
      );
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const created = await createTestUser({ email: 'login@example.com', password: 'MyPass123' });
      const result = await AuthService.login({ email: 'login@example.com', password: 'MyPass123' });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw for wrong password', async () => {
      await createTestUser({ email: 'wrong@example.com', password: 'CorrectPass' });
      await expect(
        AuthService.login({ email: 'wrong@example.com', password: 'WrongPass' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw for non-existent email', async () => {
      await expect(
        AuthService.login({ email: 'nobody@example.com', password: 'AnyPass123' })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('should remove refresh token', async () => {
      const user = await createTestUser();
      const refreshToken = generateRefreshToken(user._id);
      const { token } = jwt.verify(refreshToken, config.jwt.refreshSecret);
    });

    it('should not throw for non-existent user', async () => {
      await expect(AuthService.logout(new mongoose.Types.ObjectId(), 'some-token')).resolves.not.toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh with valid token', async () => {
      const user = await createTestUser();
      const refreshToken = generateRefreshToken(user._id);
      user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
      await user.save();

      const result = await AuthService.refreshAccessToken(refreshToken);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('forgotPassword', () => {
    it('should not throw if email does not exist', async () => {
      await expect(AuthService.forgotPassword('ghost@example.com')).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should throw for invalid token', async () => {
      await expect(AuthService.resetPassword('bad-token', 'NewPass123')).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });
  });
});
