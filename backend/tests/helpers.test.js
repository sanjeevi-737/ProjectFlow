import { hashPassword, comparePassword, generateToken, generateOTP, generateInviteCode, sanitizeUser, parsePagination, buildSort } from '../src/utils/helpers.js';

describe('helpers', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hashed = await hashPassword('TestPass123');
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe('TestPass123');
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for same input', async () => {
      const hash1 = await hashPassword('SamePassword');
      const hash2 = await hashPassword('SamePassword');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const hashed = await hashPassword('CorrectPass');
      const result = await comparePassword('CorrectPass', hashed);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hashed = await hashPassword('CorrectPass');
      const result = await comparePassword('WrongPass', hashed);
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a hex string of default length 64', () => {
      const token = generateToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate a token of custom length', () => {
      const token = generateToken(16);
      expect(token).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should generate unique tokens', () => {
      const t1 = generateToken();
      const t2 = generateToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit OTP by default', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate OTP of custom length', () => {
      const otp = generateOTP(4);
      expect(otp).toMatch(/^\d{4}$/);
    });
  });

  describe('generateInviteCode', () => {
    it('should generate an uppercase string', () => {
      const code = generateInviteCode();
      expect(code).toBe(code.toUpperCase());
    });

    it('should generate unique codes', () => {
      const c1 = generateInviteCode();
      const c2 = generateInviteCode();
      expect(c1).not.toBe(c2);
    });

    it('should be at least 8 characters', () => {
      const code = generateInviteCode();
      expect(code.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove sensitive fields', () => {
      const user = {
        name: 'Test',
        email: 'test@example.com',
        password: 'hashed',
        refreshTokens: [{ token: 'abc' }],
        emailVerificationToken: 'evt',
        emailVerificationExpires: new Date(),
        passwordResetToken: 'prt',
        passwordResetExpires: new Date(),
        __v: 0,
      };

      const sanitized = sanitizeUser(user);
      expect(sanitized.name).toBe('Test');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.refreshTokens).toBeUndefined();
      expect(sanitized.emailVerificationToken).toBeUndefined();
      expect(sanitized.emailVerificationExpires).toBeUndefined();
      expect(sanitized.passwordResetToken).toBeUndefined();
      expect(sanitized.passwordResetExpires).toBeUndefined();
      expect(sanitized.__v).toBeUndefined();
    });

    it('should handle plain objects', () => {
      const user = { name: 'Test', password: 'secret' };
      const sanitized = sanitizeUser(user);
      expect(sanitized.name).toBe('Test');
      expect(sanitized.password).toBeUndefined();
    });
  });

  describe('parsePagination', () => {
    it('should return defaults for empty query', () => {
      const result = parsePagination({});
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it('should parse page and limit', () => {
      const result = parsePagination({ page: '3', limit: '10' });
      expect(result).toEqual({ page: 3, limit: 10, skip: 20 });
    });

    it('should clamp page to minimum 1', () => {
      const result = parsePagination({ page: '-5' });
      expect(result.page).toBe(1);
    });

    it('should clamp limit to max 100', () => {
      const result = parsePagination({ limit: '500' });
      expect(result.limit).toBe(100);
    });

    it('should use default 20 when limit is 0 (falsy)', () => {
      const result = parsePagination({ limit: '0' });
      expect(result.limit).toBe(20);
    });
  });

  describe('buildSort', () => {
    it('should return default sort when no sort provided', () => {
      expect(buildSort({})).toBe('-createdAt');
    });

    it('should build descending sort', () => {
      expect(buildSort({ sort: 'title' })).toBe('-title');
    });

    it('should build ascending sort when order is asc', () => {
      expect(buildSort({ sort: 'title', order: 'asc' })).toBe('title');
    });

    it('should build descending sort when order is desc', () => {
      expect(buildSort({ sort: 'title', order: 'desc' })).toBe('-title');
    });

    it('should use custom default sort', () => {
      expect(buildSort({}, 'name')).toBe('name');
    });
  });
});
