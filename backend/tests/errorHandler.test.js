import { jest } from '@jest/globals';
import errorHandler from '../src/middlewares/errorHandler.js';
import { ApiError } from '../src/utils/apiResponse.js';
import config from '../src/config/index.js';

describe('errorHandler middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { originalUrl: '/api/test', method: 'GET' };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should handle ApiError with correct status code', () => {
    const error = ApiError.notFound('Resource missing');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        message: 'Resource missing',
      })
    );
  });

  it('should handle CastError (invalid ObjectId)', () => {
    const error = new Error('Cast to ObjectId failed');
    error.name = 'CastError';
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid resource ID' })
    );
  });

  it('should handle duplicate key error (code 11000)', () => {
    const error = new Error('Duplicate key');
    error.code = 11000;
    error.keyValue = { email: 'test@example.com' };
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('email') })
    );
  });

  it('should handle ValidationError', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = {
      name: { message: 'Name is required' },
      email: { message: 'Email is invalid' },
    };
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ errors: ['Name is required', 'Email is invalid'] })
    );
  });

  it('should handle JsonWebTokenError', () => {
    const error = new Error('jwt malformed');
    error.name = 'JsonWebTokenError';
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token' })
    );
  });

  it('should handle TokenExpiredError', () => {
    const error = new Error('jwt expired');
    error.name = 'TokenExpiredError';
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token expired' })
    );
  });

  it('should handle MulterError', () => {
    const error = new Error('File too large');
    error.name = 'MulterError';
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('File upload error') })
    );
  });

  it('should default to 500 for unknown errors', () => {
    const error = new Error('Something broke');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Something broke' })
    );
  });

  it('should include stack trace in development mode', () => {
    const originalEnv = config.env;
    config.env = 'development';

    const error = new Error('Debug me');
    errorHandler(error, mockReq, mockRes, mockNext);

    const response = mockRes.json.mock.calls[0][0];
    expect(response.stack).toBeDefined();

    config.env = originalEnv;
  });

  it('should not include stack trace in production mode', () => {
    const originalEnv = config.env;
    config.env = 'production';

    const error = new Error('No debug');
    errorHandler(error, mockReq, mockRes, mockNext);

    const response = mockRes.json.mock.calls[0][0];
    expect(response.stack).toBeUndefined();

    config.env = originalEnv;
  });
});
