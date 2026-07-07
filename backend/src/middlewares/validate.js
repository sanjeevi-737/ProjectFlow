import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiResponse.js';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    throw ApiError.badRequest('Validation failed', messages);
  }
  next();
};
