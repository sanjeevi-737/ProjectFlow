import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { ApiError } from '../utils/apiResponse.js';
import User from '../models/User.js';

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isEmailVerified) {
      throw ApiError.unauthorized('Please verify your email first');
    }

    if (user.isDeleted) {
      throw ApiError.unauthorized('Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid token'));
    }
  }
};

export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};
