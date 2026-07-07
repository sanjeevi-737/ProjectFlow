import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import DashboardService from '../services/DashboardService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [stats, distribution, activity, recentTasks] = await Promise.all([
    DashboardService.getStats(req.user._id),
    DashboardService.getTaskDistribution(req.user._id),
    DashboardService.getRecentActivity(req.user._id),
    DashboardService.getRecentTasks(req.user._id),
  ]);

  ApiResponse.success(res, {
    data: { stats, distribution, activity, recentTasks },
  });
});
