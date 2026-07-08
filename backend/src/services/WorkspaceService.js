import Workspace from '../models/Workspace.js';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import { generateInviteCode } from '../utils/helpers.js';
import { ApiError } from '../utils/apiResponse.js';
import { sendEmail } from '../emails/emailService.js';
import config from '../config/index.js';

class WorkspaceService {
  async create(data, userId) {
    const workspace = await Workspace.create({
      ...data,
      owner: userId,
      inviteCode: generateInviteCode(),
      members: [{ user: userId, role: 'admin' }],
    });

    return workspace;
  }

  async getById(workspaceId, userId) {
    userId = String(userId);
    const workspace = await Workspace.findById(workspaceId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    if (!workspace) throw ApiError.notFound('Workspace not found');

    const isMember = workspace.members.some((m) => String(m.user._id || m.user) === userId);
    if (!isMember) throw ApiError.forbidden('Not a member of this workspace');

    return workspace;
  }

  async getUserWorkspaces(userId) {
    const workspaces = await Workspace.find({ 'members.user': userId })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .sort('-updatedAt');

    return workspaces;
  }

  async update(workspaceId, data, userId) {
    userId = String(userId);
    const workspace = await this.getById(workspaceId, userId);
    this.checkAdminAccess(workspace, userId);

    if (data.name) workspace.name = data.name;
    if (data.description !== undefined) workspace.description = data.description;
    if (data.logo) {
      workspace.logo = { url: data.logo.url, publicId: data.logo.publicId };
    }
    if (data.settings) Object.assign(workspace.settings, data.settings);

    await workspace.save();
    return workspace;
  }

  async delete(workspaceId, userId) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw ApiError.notFound('Workspace not found');
    if (String(workspace.owner) !== String(userId)) throw ApiError.forbidden('Only the owner can delete the workspace');

    await Workspace.deleteOne({ _id: workspaceId });
  }

  async inviteMember(workspaceId, { email, role }, userId) {
    userId = String(userId);
    const workspace = await this.getById(workspaceId, userId);
    this.checkAdminAccess(workspace, userId);

    const invitedUser = await User.findOne({ email });
    if (invitedUser) {
      const isAlreadyMember = workspace.members.some(
        (m) => m.user.toString() === invitedUser._id.toString()
      );
      if (isAlreadyMember) throw ApiError.conflict('User is already a member');
    }

    const existingInvitation = await Invitation.findOne({
      email,
      workspace: workspaceId,
      status: 'pending',
    });
    if (existingInvitation) throw ApiError.conflict('Invitation already sent');

    const token = generateInviteCode() + '-' + generateInviteCode();
    const invitation = await Invitation.create({
      email,
      workspace: workspaceId,
      invitedBy: userId,
      invitedUser: invitedUser?._id,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    if (invitedUser) {
      await sendEmail({
        to: email,
        template: 'workspaceInvitation',
        data: {
          name: invitedUser.name,
          workspaceName: workspace.name,
          invitedByName: (await User.findById(userId)).name,
          role,
          inviteLink: `${config.clientUrl}/workspaces/${workspaceId}/invite?token=${token}`,
        },
      });
    }

    return invitation;
  }

  async acceptInvitation(token, userId) {
    userId = String(userId);
    const invitation = await Invitation.findOne({ token, status: 'pending', expiresAt: { $gt: new Date() } });
    if (!invitation) throw ApiError.badRequest('Invalid or expired invitation');

    const workspace = await Workspace.findById(invitation.workspace);
    if (!workspace) throw ApiError.notFound('Workspace not found');

    const isMember = workspace.members.some((m) => String(m.user) === userId);
    if (isMember) throw ApiError.conflict('Already a member');

    workspace.members.push({ user: userId, role: invitation.role });
    await workspace.save();

    invitation.status = 'accepted';
    invitation.invitedUser = userId;
    await invitation.save();

    return workspace;
  }

  async removeMember(workspaceId, memberId, userId) {
    userId = String(userId);
    const workspace = await this.getById(workspaceId, userId);
    this.checkAdminAccess(workspace, userId);

    if (String(workspace.owner) === memberId) {
      throw ApiError.badRequest('Cannot remove the workspace owner');
    }

    workspace.members = workspace.members.filter((m) => String(m.user) !== memberId);
    await workspace.save();

    return workspace;
  }

  async updateMemberRole(workspaceId, memberId, role, userId) {
    userId = String(userId);
    const workspace = await this.getById(workspaceId, userId);
    this.checkAdminAccess(workspace, userId);

    const member = workspace.members.find((m) => String(m.user) === memberId);
    if (!member) throw ApiError.notFound('Member not found');

    member.role = role;
    await workspace.save();

    return workspace;
  }

  checkAdminAccess(workspace, userId) {
    userId = String(userId);
    const member = workspace.members.find((m) => String(m.user._id || m.user) === userId);
    if (!member || !['admin', 'project_manager'].includes(member.role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }
  }

  async getInvitations(workspaceId, userId) {
    userId = String(userId);
    const workspace = await this.getById(workspaceId, userId);
    this.checkAdminAccess(workspace, userId);

    return Invitation.find({ workspace: workspaceId })
      .populate('invitedBy', 'name email')
      .sort('-createdAt');
  }
}

export default new WorkspaceService();
