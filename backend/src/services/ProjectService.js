import Project from '../models/Project.js';
import Board from '../models/Board.js';
import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';
import { ApiError } from '../utils/apiResponse.js';

const DEFAULT_COLUMNS = [
  { name: 'To Do', color: '#6b7280', order: 0 },
  { name: 'In Progress', color: '#3b82f6', order: 1 },
  { name: 'Review', color: '#f59e0b', order: 2 },
  { name: 'Completed', color: '#10b981', order: 3 },
];

class ProjectService {
  async create(data, userId) {
    userId = String(userId);
    const workspace = await Workspace.findById(data.workspace);
    if (!workspace) throw ApiError.notFound('Workspace not found');

    const isMember = workspace.members.some((m) => String(m.user) === userId);
    if (!isMember) throw ApiError.forbidden('Not a member of this workspace');

    const project = await Project.create({
      ...data,
      owner: userId,
      members: [{ user: userId, role: 'admin' }],
    });

    const defaultBoard = await Board.create({
      name: 'Kanban Board',
      project: project._id,
      columns: DEFAULT_COLUMNS,
      isDefault: true,
    });

    project.boards = [defaultBoard];
    return { project, defaultBoard };
  }

  async getById(projectId, userId) {
    userId = String(userId);
    const project = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    if (!project) throw ApiError.notFound('Project not found');

    const isMember = project.members.some((m) => String(m.user._id || m.user) === userId);
    if (!isMember) throw ApiError.forbidden('Not a project member');

    return project;
  }

  async getByWorkspace(workspaceId, userId, filters = {}) {
    userId = String(userId);
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw ApiError.notFound('Workspace not found');

    const isMember = workspace.members.some((m) => String(m.user) === userId);
    if (!isMember) throw ApiError.forbidden('Not a member of this workspace');

    const query = { workspace: workspaceId, ...filters };
    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-updatedAt');

    return projects;
  }

  async update(projectId, data, userId) {
    userId = String(userId);
    const project = await this.getById(projectId, userId);
    this.checkAccess(project, userId);

    Object.assign(project, data);
    await project.save();
    return project;
  }

  async delete(projectId, userId) {
    userId = String(userId);
    const project = await this.getById(projectId, userId);
    if (String(project.owner) !== userId) throw ApiError.forbidden('Only the owner can delete the project');

    await Promise.all([
      Task.deleteMany({ project: projectId }),
      Board.deleteMany({ project: projectId }),
      Project.deleteOne({ _id: projectId }),
    ]);
  }

  async archive(projectId, userId) {
    userId = String(userId);
    const project = await this.getById(projectId, userId);
    this.checkAccess(project, userId);

    project.status = project.status === 'archived' ? 'active' : 'archived';
    await project.save();
    return project;
  }

  async addMember(projectId, userId, memberId, role) {
    userId = String(userId);
    const project = await this.getById(projectId, userId);
    this.checkAdminAccess(project, userId);

    const isMember = project.members.some((m) => String(m.user._id || m.user) === memberId);
    if (isMember) throw ApiError.conflict('User is already a member');

    project.members.push({ user: memberId, role: role || 'team_member' });
    await project.save();
    return project;
  }

  async removeMember(projectId, userId, memberId) {
    userId = String(userId);
    const project = await this.getById(projectId, userId);
    this.checkAdminAccess(project, userId);

    project.members = project.members.filter((m) => String(m.user._id || m.user) !== memberId);
    await project.save();
    return project;
  }

  async getBoards(projectId, userId) {
    await this.getById(projectId, userId);
    return Board.find({ project: projectId }).sort('createdAt');
  }

  checkAccess(project, userId) {
    userId = String(userId);
    const member = project.members.find((m) => String(m.user._id || m.user) === userId);
    if (!member) throw ApiError.forbidden('Not a project member');
  }

  checkAdminAccess(project, userId) {
    userId = String(userId);
    const member = project.members.find((m) => String(m.user._id || m.user) === userId);
    if (!member || !['admin', 'project_manager'].includes(member.role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }
  }
}

export default new ProjectService();
