import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateOTP = (length = 6) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

export const generateInviteCode = () => {
  return crypto.randomUUID().split('-')[0].toUpperCase();
};

export const sanitizeUser = (user) => {
  const doc = user.toObject ? user.toObject() : user;
  const { password: _p, refreshTokens: _rt, emailVerificationToken: _evt, emailVerificationExpires: _eve, passwordResetToken: _prt, passwordResetExpires: _pre, __v: _v, ...sanitized } = doc;
  return sanitized;
};

export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildSort = (query, defaultSort = '-createdAt') => {
  const { sort, order } = query;
  if (!sort) return defaultSort;
  const sortOrder = order === 'asc' ? '' : '-';
  return `${sortOrder}${sort}`;
};
