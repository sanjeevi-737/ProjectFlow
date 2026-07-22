import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import ProjectService from './ProjectService.js';
import BoardService from './BoardService.js';
import { emitToBoard, emitToTask, emitToUser } from '../socket/index.js';
import { ApiError } from '../utils/apiResponse.js';

class TaskService {
  async create(data, userId) {
    const board = await BoardService.getById(data.board, userId);

    if (!board.columns.some((c) => c.name === data.column)) {
      throw ApiError.badRequest(`Column "${data.column}" does not exist on this board`);
    }

    const maxOrder = await Task.findOne({ board: data.board, column: data.column })
      .sort('-columnOrder')
      .select('columnOrder');

    const task = await Task.create({
      ...data,
      columnOrder: maxOrder ? maxOrder.columnOrder + 1 : 0,
      createdBy: userId,
    });

    await this.logActivity(task._id, userId, {
      action: 'created',
      description: `Task "${task.title}" was created`,
    });

    if (data.assignees?.length > 0) {
      await this.createAssignmentNotifications(task, data.assignees, userId);
    }

    const populated = await task.populate([
      { path: 'assignees', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    emitToBoard(task.board.toString(), 'task:created', populated);

    return populated;
  }

  async getById(taskId, userId) {
    const task = await Task.findById(taskId)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('attachments.uploadedBy', 'name email avatar');

    if (!task) throw ApiError.notFound('Task not found');
    await ProjectService.getById(task.project.toString(), userId);

    return task;
  }

  async getByBoard(boardId, userId) {
    await BoardService.getById(boardId, userId);

    const tasks = await Task.find({ board: boardId, isDeleted: false, isArchived: false })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('columnOrder');

    return tasks;
  }

  async getByProject(projectId, userId, filters = {}) {
    await ProjectService.getById(projectId, userId);

    const query = { project: projectId, isDeleted: false, ...filters };
    const tasks = await Task.find(query)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    return tasks;
  }

  async update(taskId, data, userId) {
    const task = await this.getById(taskId, userId);

    if (data.column && data.column !== task.column) {
      const board = await BoardService.getById(task.board.toString(), userId);
      if (!board.columns.some((c) => c.name === data.column)) {
        throw ApiError.badRequest(`Column "${data.column}" does not exist on this board`);
      }

      const maxOrder = await Task.findOne({ board: task.board, column: data.column })
        .sort('-columnOrder')
        .select('columnOrder');
      data.columnOrder = maxOrder ? maxOrder.columnOrder + 1 : 0;
    }

    const oldData = { ...task.toObject() };
    Object.assign(task, data);
    await task.save();

    const changes = this.getChanges(oldData, task.toObject());
    if (Object.keys(changes).length > 0) {
      await this.logActivity(task._id, userId, {
        action: 'updated',
        changes,
        description: `Task "${task.title}" was updated`,
      });
    }

    const populated = await task.populate([
      { path: 'assignees', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    emitToBoard(task.board.toString(), 'task:updated', populated);

    return populated;
  }

  async delete(taskId, userId) {
    const task = await this.getById(taskId, userId);
    task.isDeleted = true;
    await task.save();

    await this.logActivity(task._id, userId, {
      action: 'deleted',
      description: `Task "${task.title}" was deleted`,
    });

    emitToBoard(task.board.toString(), 'task:deleted', { taskId: task._id, boardId: task.board });
  }

  async moveTask(taskId, boardId, column, order, userId) {
    const task = await this.getById(taskId, userId);
    const oldColumn = task.column;

    if (boardId) task.board = boardId;
    if (column) {
      const board = await BoardService.getById(boardId || task.board, userId);
      if (!board.columns.some((c) => c.name === column)) {
        throw ApiError.badRequest(`Column "${column}" does not exist`);
      }
      task.column = column;
    }
    if (order !== undefined) task.columnOrder = order;

    await task.save();

    await this.logActivity(task._id, userId, {
      action: 'moved',
      description: `Task "${task.title}" was moved to ${column}`,
    });

    const populated = await task.populate([
      { path: 'assignees', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    emitToBoard(populated.board.toString(), 'task:moved', {
      task: populated,
      sourceColumn: oldColumn,
      destinationColumn: column,
    });

    return populated;
  }

  async addComment(taskId, text, userId) {
    await this.getById(taskId, userId);

    const comment = await Comment.create({
      text,
      task: taskId,
      author: userId,
    });

    await this.logActivity(taskId, userId, {
      action: 'commented',
      description: `A comment was added to the task`,
    });

    const populated = await comment.populate('author', 'name email avatar');

    emitToTask(taskId, 'comment:added', populated);

    return populated;
  }

  async getComments(taskId, userId) {
    await this.getById(taskId, userId);

    return Comment.find({ task: taskId, isDeleted: false })
      .populate('author', 'name email avatar')
      .sort('createdAt');
  }

  async deleteComment(taskId, commentId, userId) {
    await this.getById(taskId, userId);

    const comment = await Comment.findOne({ _id: commentId, task: taskId });
    if (!comment) throw ApiError.notFound('Comment not found');

    if (comment.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    comment.isDeleted = true;
    await comment.save();

    emitToTask(taskId, 'comment:deleted', { commentId, taskId });

    return comment;
  }

  async updateChecklist(taskId, checklist, userId) {
    const task = await this.getById(taskId, userId);
    task.checklist = checklist;
    await task.save();
    return task;
  }

  async updateSubtasks(taskId, subtasks, userId) {
    const task = await this.getById(taskId, userId);
    task.subtasks = subtasks;
    await task.save();
    return task;
  }

  async addAttachment(taskId, fileData, userId) {
    const task = await this.getById(taskId, userId);

    task.attachments.push({
      ...fileData,
      uploadedBy: userId,
    });

    await task.save();

    await this.logActivity(taskId, userId, {
      action: 'attachment_added',
      description: `File "${fileData.filename}" was added`,
    });

    return task.populate('attachments.uploadedBy', 'name email avatar');
  }

  async removeAttachment(taskId, attachmentId, userId) {
    const task = await this.getById(taskId, userId);
    task.attachments.pull({ _id: attachmentId });
    await task.save();
    return task;
  }

  async getActivityLog(taskId, userId) {
    await this.getById(taskId, userId);

    return ActivityLog.find({ task: taskId })
      .populate('performedBy', 'name email avatar')
      .sort('-createdAt');
  }

  async logActivity(taskId, userId, data) {
    const task = await Task.findById(taskId).select('project');
    if (!task) return;

    return ActivityLog.create({
      ...data,
      entityType: 'task',
      entityId: taskId,
      task: taskId,
      project: task.project,
      performedBy: userId,
    });
  }

  async createAssignmentNotifications(task, assigneeIds, assignedBy) {
    const notifications = assigneeIds
      .filter((id) => id.toString() !== assignedBy)
      .map((userId) => ({
        recipient: userId,
        sender: assignedBy,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        link: `/tasks/${task._id}`,
        metadata: { taskId: task._id, projectId: task.project },
      }));

    if (notifications.length > 0) {
      const created = await Notification.insertMany(notifications);
      for (let i = 0; i < created.length; i++) {
        const notif = created[i];
        const targetId = assigneeIds.filter((id) => id.toString() !== assignedBy)[i];
        if (targetId) {
          emitToUser(targetId.toString(), 'notification:received', {
            ...notif.toObject(),
            _id: notif._id.toString(),
          });
        }
      }
    }
  }

  getChanges(oldData, newData) {
    const fields = ['title', 'description', 'priority', 'dueDate', 'column', 'assignees'];
    const changes = {};

    fields.forEach((field) => {
      const oldVal = JSON.stringify(oldData[field]);
      const newVal = JSON.stringify(newData[field]);
      if (oldVal !== newVal) {
        changes[field] = { from: oldData[field], to: newData[field] };
      }
    });

    return changes;
  }
}

export default new TaskService();
