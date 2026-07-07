import User from '../models/User.js';
import { hashPassword, comparePassword, sanitizeUser } from '../utils/helpers.js';
import { ApiError } from '../utils/apiResponse.js';

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return sanitizeUser(user);
  }

  async updateProfile(userId, { name, avatar }) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (name) user.name = name;
    if (avatar) {
      user.avatar = {
        url: avatar.url,
        publicId: avatar.publicId,
      };
    }

    await user.save();
    return sanitizeUser(user);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    user.password = await hashPassword(newPassword);
    user.refreshTokens = [];
    await user.save();
  }

  async updateNotificationPreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    Object.assign(user.notificationPreferences, preferences);
    await user.save();
    return sanitizeUser(user);
  }

  async searchUsers(query, excludeUserId) {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: excludeUserId },
      isDeleted: false,
    })
      .select('name email avatar')
      .limit(20);

    return users;
  }

  async getAllUsers(page, limit) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({ isDeleted: false })
        .select('-password -refreshTokens')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      User.countDocuments({ isDeleted: false }),
    ]);

    return {
      users: users.map((u) => sanitizeUser(u)),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}

export default new UserService();
