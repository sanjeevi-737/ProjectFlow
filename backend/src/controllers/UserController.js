import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/apiResponse.js';
import UserService from '../services/UserService.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getProfile(req.user._id);
  ApiResponse.success(res, { data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserService.updateProfile(req.user._id, req.body);
  ApiResponse.success(res, { message: 'Profile updated', data: user });
});

export const changePassword = asyncHandler(async (req, res) => {
  await UserService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  ApiResponse.success(res, { message: 'Password changed successfully' });
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await UserService.updateNotificationPreferences(req.user._id, req.body);
  ApiResponse.success(res, { message: 'Notification preferences updated', data: user });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }
  const avatar = {
    url: `/uploads/${req.file.filename}`,
    publicId: '',
  };
  const user = await UserService.updateProfile(req.user._id, { avatar });
  ApiResponse.success(res, { message: 'Avatar updated', data: user });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const users = await UserService.searchUsers(req.query.q, req.user._id);
  ApiResponse.success(res, { data: users });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await UserService.getAllUsers(page, limit);
  ApiResponse.paginated(res, { data: result.users, meta: { total: result.total, page: result.page, pages: result.pages } });
});
