import { jest } from '@jest/globals';
import { ApiResponse, ApiError } from '../src/utils/apiResponse.js';

describe('ApiResponse', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('success', () => {
    it('should return 200 with data', () => {
      const res = mockRes();
      ApiResponse.success(res, { data: { id: 1 } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          statusCode: 200,
          message: 'Success',
          data: { id: 1 },
        })
      );
    });

    it('should allow custom message', () => {
      const res = mockRes();
      ApiResponse.success(res, { message: 'Found it' });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Found it' })
      );
    });

    it('should include meta when provided', () => {
      const res = mockRes();
      ApiResponse.success(res, { data: [], meta: { total: 10 } });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ meta: { total: 10 } })
      );
    });
  });

  describe('created', () => {
    it('should return 201', () => {
      const res = mockRes();
      ApiResponse.created(res, { data: { id: 1 } });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, statusCode: 201 })
      );
    });
  });

  describe('paginated', () => {
    it('should return 200 with data and meta', () => {
      const res = mockRes();
      ApiResponse.paginated(res, { data: [1, 2], meta: { page: 1, total: 2 } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: [1, 2], meta: { page: 1, total: 2 } })
      );
    });
  });
});

describe('ApiError', () => {
  it('should create error with statusCode and message', () => {
    const error = new ApiError(400, 'Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.isOperational).toBe(true);
  });

  it('should include errors array', () => {
    const error = new ApiError(400, 'Validation failed', ['Name required']);
    expect(error.errors).toEqual(['Name required']);
  });

  describe('static factory methods', () => {
    it('badRequest returns 400', () => {
      const error = ApiError.badRequest('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('unauthorized returns 401', () => {
      const error = ApiError.unauthorized();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('forbidden returns 403', () => {
      const error = ApiError.forbidden();
      expect(error.statusCode).toBe(403);
    });

    it('notFound returns 404', () => {
      const error = ApiError.notFound();
      expect(error.statusCode).toBe(404);
    });

    it('conflict returns 409', () => {
      const error = ApiError.conflict('Already exists');
      expect(error.statusCode).toBe(409);
    });

    it('tooMany returns 429', () => {
      const error = ApiError.tooMany();
      expect(error.statusCode).toBe(429);
    });

    it('internal returns 500', () => {
      const error = ApiError.internal();
      expect(error.statusCode).toBe(500);
    });
  });
});
