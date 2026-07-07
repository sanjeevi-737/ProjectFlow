import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../utils/apiResponse.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: req.user._id, isDeleted: false })
      .populate('sender', 'name email avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: req.user._id, isDeleted: false }),
  ]);

  ApiResponse.paginated(res, {
    data: notifications,
    meta: { total, page, pages: Math.ceil(total / limit) },
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
    isDeleted: false,
  });

  ApiResponse.success(res, { data: { count } });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw ApiError.notFound('Notification not found');
  ApiResponse.success(res, { data: notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  ApiResponse.success(res, { message: 'All notifications marked as read' });
});

export const remove = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isDeleted: true },
    { new: true }
  );

  if (!notification) throw ApiError.notFound('Notification not found');
  ApiResponse.success(res, { message: 'Notification deleted' });
});
