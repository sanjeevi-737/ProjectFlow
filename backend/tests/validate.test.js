import { jest } from '@jest/globals';

jest.unstable_mockModule('express-validator', () => ({
  validationResult: jest.fn(),
}));

const { validationResult } = await import('express-validator');
const { validate } = await import('../src/middlewares/validate.js');
const { ApiError } = await import('../src/utils/apiResponse.js');

describe('validate middleware', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('should call next when no validation errors', () => {
    const mockNext = jest.fn();
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });

    validate({}, mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw ApiError when validation errors exist', () => {
    const errors = [
      { msg: 'Name is required' },
      { msg: 'Email is invalid' },
    ];
    validationResult.mockReturnValue({ isEmpty: () => false, array: () => errors });

    expect(() => validate({}, mockRes(), jest.fn())).toThrow(ApiError);
    try {
      validate({}, mockRes(), jest.fn());
    } catch (error) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(['Name is required', 'Email is invalid']);
    }
  });
});
