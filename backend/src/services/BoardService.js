import Board from '../models/Board.js';
import Task from '../models/Task.js';
import ProjectService from './ProjectService.js';
import { ApiError } from '../utils/apiResponse.js';

class BoardService {
  async create(data, userId) {
    await ProjectService.getById(data.project, userId);

    const maxOrder = await Board.findOne({ project: data.project }).sort('-columns.order');
    const startOrder = maxOrder ? maxOrder.columns.length : 0;

    const columns = data.columns.map((col, i) => ({
      ...col,
      order: i + startOrder,
    }));

    const board = await Board.create({ ...data, columns });
    return board;
  }

  async getById(boardId, userId) {
    userId = String(userId);
    const board = await Board.findById(boardId).populate({
      path: 'project',
      select: 'name workspace members',
    });

    if (!board) throw ApiError.notFound('Board not found');

    const isMember = board.project.members.some((m) => String(m.user._id || m.user) === userId);
    if (!isMember) throw ApiError.forbidden('Not a project member');

    return board;
  }

  async getByProject(projectId, userId) {
    await ProjectService.getById(projectId, userId);
    return Board.find({ project: projectId }).sort('createdAt');
  }

  async update(boardId, data, userId) {
    const board = await this.getById(boardId, userId);
    Object.assign(board, data);
    await board.save();
    return board;
  }

  async delete(boardId, userId) {
    const board = await this.getById(boardId, userId);
    if (board.isDefault) throw ApiError.badRequest('Cannot delete the default board');

    const taskCount = await Task.countDocuments({ board: boardId });
    if (taskCount > 0) throw ApiError.badRequest('Cannot delete board with existing tasks');

    await Board.deleteOne({ _id: boardId });
  }

  async addColumn(boardId, data, userId) {
    const board = await this.getById(boardId, userId);

    const maxOrder = board.columns.reduce((max, col) => Math.max(max, col.order), -1);
    board.columns.push({
      name: data.name,
      color: data.color || '#6366f1',
      order: maxOrder + 1,
      taskLimit: data.taskLimit || 0,
    });

    await board.save();
    return board;
  }

  async updateColumn(boardId, columnId, data, userId) {
    const board = await this.getById(boardId, userId);

    const column = board.columns.id(columnId);
    if (!column) throw ApiError.notFound('Column not found');

    Object.assign(column, data);
    await board.save();
    return board;
  }

  async deleteColumn(boardId, columnId, userId) {
    const board = await this.getById(boardId, userId);

    const columnIndex = board.columns.findIndex((c) => c._id.toString() === columnId);
    if (columnIndex === -1) throw ApiError.notFound('Column not found');

    const taskCount = await Task.countDocuments({ board: boardId, column: board.columns[columnIndex].name });
    if (taskCount > 0) {
      throw ApiError.badRequest('Cannot delete column with existing tasks. Move tasks first.');
    }

    board.columns.pull({ _id: columnId });
    await board.save();
    return board;
  }

  async reorderColumns(boardId, columnIds, userId) {
    const board = await this.getById(boardId, userId);

    columnIds.forEach((id, index) => {
      const column = board.columns.id(id);
      if (column) column.order = index;
    });

    await board.save();
    return board;
  }
}

export default new BoardService();
