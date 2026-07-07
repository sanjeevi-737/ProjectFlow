import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import BoardService from '../services/BoardService.js';

export const create = asyncHandler(async (req, res) => {
  const board = await BoardService.create(req.body, req.user._id);
  ApiResponse.created(res, { data: board });
});

export const getById = asyncHandler(async (req, res) => {
  const board = await BoardService.getById(req.params.id, req.user._id);
  ApiResponse.success(res, { data: board });
});

export const getByProject = asyncHandler(async (req, res) => {
  const boards = await BoardService.getByProject(req.params.projectId, req.user._id);
  ApiResponse.success(res, { data: boards });
});

export const update = asyncHandler(async (req, res) => {
  const board = await BoardService.update(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, { message: 'Board updated', data: board });
});

export const remove = asyncHandler(async (req, res) => {
  await BoardService.delete(req.params.id, req.user._id);
  ApiResponse.success(res, { message: 'Board deleted' });
});

export const addColumn = asyncHandler(async (req, res) => {
  const board = await BoardService.addColumn(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, { message: 'Column added', data: board });
});

export const updateColumn = asyncHandler(async (req, res) => {
  const board = await BoardService.updateColumn(req.params.id, req.params.columnId, req.body, req.user._id);
  ApiResponse.success(res, { message: 'Column updated', data: board });
});

export const deleteColumn = asyncHandler(async (req, res) => {
  const board = await BoardService.deleteColumn(req.params.id, req.params.columnId, req.user._id);
  ApiResponse.success(res, { message: 'Column deleted', data: board });
});

export const reorderColumns = asyncHandler(async (req, res) => {
  const board = await BoardService.reorderColumns(req.params.id, req.body.columnIds, req.user._id);
  ApiResponse.success(res, { message: 'Columns reordered', data: board });
});
