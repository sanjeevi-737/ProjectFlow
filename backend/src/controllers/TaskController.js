import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import TaskService from '../services/TaskService.js';
import FileUploadService from '../services/FileUploadService.js';

export const create = asyncHandler(async (req, res) => {
  const task = await TaskService.create(req.body, req.user._id);
  ApiResponse.created(res, { data: task });
});

export const getById = asyncHandler(async (req, res) => {
  const task = await TaskService.getById(req.params.id, req.user._id);
  ApiResponse.success(res, { data: task });
});

export const getByBoard = asyncHandler(async (req, res) => {
  const tasks = await TaskService.getByBoard(req.params.boardId, req.user._id);
  ApiResponse.success(res, { data: tasks });
});

export const getByProject = asyncHandler(async (req, res) => {
  const { priority, dueDate, assignee, status, label } = req.query;
  const filters = {};
  if (priority) filters.priority = priority;
  if (dueDate) filters.dueDate = { $lte: new Date(dueDate) };
  if (assignee) filters.assignees = assignee;
  if (label) filters['labels.name'] = label;
  if (status === 'archived') filters.isArchived = true;

  const tasks = await TaskService.getByProject(req.params.projectId, req.user._id, filters);
  ApiResponse.success(res, { data: tasks });
});

export const update = asyncHandler(async (req, res) => {
  const task = await TaskService.update(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, { message: 'Task updated', data: task });
});

export const remove = asyncHandler(async (req, res) => {
  await TaskService.delete(req.params.id, req.user._id);
  ApiResponse.success(res, { message: 'Task deleted' });
});

export const moveTask = asyncHandler(async (req, res) => {
  const task = await TaskService.moveTask(req.params.id, req.body.boardId, req.body.column, req.body.order, req.user._id);
  ApiResponse.success(res, { message: 'Task moved', data: task });
});

export const addComment = asyncHandler(async (req, res) => {
  const comment = await TaskService.addComment(req.params.id, req.body.text, req.user._id);
  ApiResponse.created(res, { data: comment });
});

export const getComments = asyncHandler(async (req, res) => {
  const comments = await TaskService.getComments(req.params.id, req.user._id);
  ApiResponse.success(res, { data: comments });
});

export const updateChecklist = asyncHandler(async (req, res) => {
  const task = await TaskService.updateChecklist(req.params.id, req.body.checklist, req.user._id);
  ApiResponse.success(res, { data: task });
});

export const updateSubtasks = asyncHandler(async (req, res) => {
  const task = await TaskService.updateSubtasks(req.params.id, req.body.subtasks, req.user._id);
  ApiResponse.success(res, { data: task });
});

export const addAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.badRequest('No file uploaded');
  }

  let fileData;
  try {
    const uploaded = await FileUploadService.uploadAttachment(req.file.buffer);
    fileData = {
      url: uploaded.url,
      publicId: uploaded.publicId,
      filename: req.file.originalname,
      mimetype: req.file.mimetype || uploaded.mimetype,
      size: uploaded.size || req.file.size,
    };
  } catch {
    return ApiResponse.badRequest('File upload failed');
  }

  const task = await TaskService.addAttachment(req.params.id, fileData, req.user._id);
  ApiResponse.success(res, { message: 'Attachment added', data: task });
});

export const removeAttachment = asyncHandler(async (req, res) => {
  const task = await TaskService.removeAttachment(req.params.id, req.params.attachmentId, req.user._id);

  const removed = task.attachments?.find((a) => a._id?.toString() === req.params.attachmentId);
  if (removed?.publicId) {
    await FileUploadService.deleteFile(removed.publicId);
  }

  ApiResponse.success(res, { message: 'Attachment removed', data: task });
});

export const getActivityLog = asyncHandler(async (req, res) => {
  const logs = await TaskService.getActivityLog(req.params.id, req.user._id);
  ApiResponse.success(res, { data: logs });
});
