import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import AuthService from '../services/AuthService.js';
import { sanitizeUser } from '../utils/helpers.js';

export const register = asyncHandler(async (req, res) => {
  const { user } = await AuthService.register(req.body);
  ApiResponse.created(res, {
    message: 'Registration successful. Please check your email to verify your account.',
    data: sanitizeUser(user),
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await AuthService.verifyEmail(req.params.token);
  ApiResponse.success(res, {
    message: 'Email verified successfully',
    data: sanitizeUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.login(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(res, {
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (refreshToken) {
    await AuthService.logout(req.user._id, refreshToken);
  }

  res.clearCookie('refreshToken');
  ApiResponse.success(res, { message: 'Logged out successfully' });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) {
    return ApiResponse.success(res, { message: 'No refresh token provided' });
  }

  const { user, accessToken, refreshToken: newRefreshToken } = await AuthService.refreshAccessToken(token);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(res, {
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await AuthService.forgotPassword(req.body.email);
  ApiResponse.success(res, {
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await AuthService.resetPassword(req.body.token, req.body.password);
  ApiResponse.success(res, { message: 'Password reset successful' });
});

export const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success(res, {
    data: sanitizeUser(req.user),
  });
});
