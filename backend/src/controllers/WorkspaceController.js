import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import WorkspaceService from '../services/WorkspaceService.js';

export const create = asyncHandler(async (req, res) => {
  const workspace = await WorkspaceService.create(req.body, req.user._id);
  ApiResponse.created(res, { data: workspace });
});

export const getById = asyncHandler(async (req, res) => {
  const workspace = await WorkspaceService.getById(req.params.id, req.user._id);
  ApiResponse.success(res, { data: workspace });
});

export const getUserWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await WorkspaceService.getUserWorkspaces(req.user._id);
  ApiResponse.success(res, { data: workspaces });
});

export const update = asyncHandler(async (req, res) => {
  const workspace = await WorkspaceService.update(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, { message: 'Workspace updated', data: workspace });
});

export const remove = asyncHandler(async (req, res) => {
  await WorkspaceService.delete(req.params.id, req.user._id);
  ApiResponse.success(res, { message: 'Workspace deleted' });
});

export const inviteMember = asyncHandler(async (req, res) => {
  const invitation = await WorkspaceService.inviteMember(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, { message: 'Invitation sent', data: invitation });
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  const workspace = await WorkspaceService.acceptInvitation(req.body.token, req.user._id);
  ApiResponse.success(res, { message: 'Invitation accepted', data: workspace });
});

export const removeMember = asyncHandler(async (req, res) => {
  const workspace = await WorkspaceService.removeMember(req.params.id, req.params.memberId, req.user._id);
  ApiResponse.success(res, { message: 'Member removed', data: workspace });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const workspace = await WorkspaceService.updateMemberRole(req.params.id, req.params.memberId, req.body.role, req.user._id);
  ApiResponse.success(res, { message: 'Member role updated', data: workspace });
});

export const getInvitations = asyncHandler(async (req, res) => {
  const invitations = await WorkspaceService.getInvitations(req.params.id, req.user._id);
  ApiResponse.success(res, { data: invitations });
});
