import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Workspace from '../models/Workspace.js';
import ActivityLog from '../models/ActivityLog.js';

class DashboardService {
  async getStats(userId) {
    const workspaces = await Workspace.find({ 'members.user': userId }).select('_id');
    const workspaceIds = workspaces.map((w) => w._id);

    const projects = await Project.find({ workspace: { $in: workspaceIds }, isDeleted: { $ne: true } });
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds }, isDeleted: false });
    const now = new Date();
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.column !== 'Completed');
    const completed = tasks.filter((t) => t.column === 'Completed');

    return {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: completed.length,
      overdueTasks: overdue.length,
      inProgressTasks: tasks.filter((t) => t.column === 'In Progress').length,
      totalWorkspaces: workspaces.length,
    };
  }

  async getTaskDistribution(userId) {
    const workspaces = await Workspace.find({ 'members.user': userId }).select('_id');
    const projects = await Project.find({ workspace: { $in: workspaces.map((w) => w._id) }, isDeleted: { $ne: true } }).select('_id');
    const tasks = await Task.find({ project: { $in: projects.map((p) => p._id) }, isDeleted: false });

    const byStatus = {};
    const byPriority = {};
    const byProject = {};
    const projectMap = {};

    for (const p of projects) projectMap[p._id.toString()] = p;

    for (const task of tasks) {
      byStatus[task.column] = (byStatus[task.column] || 0) + 1;

      const pri = task.priority || 'none';
      byPriority[pri] = (byPriority[pri] || 0) + 1;

      const pid = task.project?.toString();
      if (pid) {
        if (!byProject[pid]) {
          byProject[pid] = { name: projectMap[pid]?.name || 'Unknown', total: 0, completed: 0, color: projectMap[pid]?.color || '#6366f1' };
        }
        byProject[pid].total++;
        if (task.column === 'Completed') byProject[pid].completed++;
      }
    }

    return { byStatus, byPriority, byProject: Object.values(byProject) };
  }

  async getRecentActivity(userId, limit = 10) {
    const workspaces = await Workspace.find({ 'members.user': userId }).select('_id');
    const projects = await Project.find({ workspace: { $in: workspaces.map((w) => w._id) }, isDeleted: { $ne: true } }).select('_id');

    return ActivityLog.find({ project: { $in: projects.map((p) => p._id) } })
      .populate('performedBy', 'name email avatar')
      .sort('-createdAt')
      .limit(limit);
  }

  async getRecentTasks(userId, limit = 5) {
    const workspaces = await Workspace.find({ 'members.user': userId }).select('_id');
    const projects = await Project.find({ workspace: { $in: workspaces.map((w) => w._id) }, isDeleted: { $ne: true } }).select('_id');

    return Task.find({ project: { $in: projects.map((p) => p._id) }, isDeleted: false, isArchived: false })
      .populate('assignees', 'name email avatar')
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(limit);
  }
}

export default new DashboardService();
