import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import ProjectService from '../services/ProjectService.js';

export const create = asyncHandler(async (req, res) => {
  const { project, defaultBoard } = await ProjectService.create(req.body, req.user._id);
  ApiResponse.created(res, { data: { project, defaultBoard } });
});

export const getById = asyncHandler(async (req, res) => {
  const project = await ProjectService.getById(req.params.id, req.user._id);
  ApiResponse.success(res, { data: project });
});

export const getByWorkspace = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filters = {};
  if (status) filters.status = status;
  const projects = await ProjectService.getByWorkspace(req.params.workspaceId, req.user._id, filters);
  ApiResponse.success(res, { data: projects });
});

export const update = asyncHandler(async (req, res) => {
  const project = await ProjectService.update(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, { message: 'Project updated', data: project });
});

export const remove = asyncHandler(async (req, res) => {
  await ProjectService.delete(req.params.id, req.user._id);
  ApiResponse.success(res, { message: 'Project deleted' });
});

export const archive = asyncHandler(async (req, res) => {
  const project = await ProjectService.archive(req.params.id, req.user._id);
  ApiResponse.success(res, { message: `Project ${project.status === 'active' ? 'restored' : 'archived'}`, data: project });
});

export const addMember = asyncHandler(async (req, res) => {
  const project = await ProjectService.addMember(req.params.id, req.user._id, req.body.userId, req.body.role);
  ApiResponse.success(res, { message: 'Member added', data: project });
});

export const removeMember = asyncHandler(async (req, res) => {
  const project = await ProjectService.removeMember(req.params.id, req.user._id, req.params.memberId);
  ApiResponse.success(res, { message: 'Member removed', data: project });
});

export const getBoards = asyncHandler(async (req, res) => {
  const boards = await ProjectService.getBoards(req.params.id, req.user._id);
  ApiResponse.success(res, { data: boards });
});
