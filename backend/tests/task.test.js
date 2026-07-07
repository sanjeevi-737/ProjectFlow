import request from 'supertest';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestWorkspace, createTestProject, generateToken } from './setup.js';

let app;

beforeAll(async () => {
  await setupTestDB();
  const module = await import('../src/server.js');
  app = module.default;
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Task API', () => {
  let user, token, project, board;

  beforeEach(async () => {
    user = await createTestUser({ role: 'admin' });
    token = generateToken(user._id);
    const workspace = await createTestWorkspace(user._id);
    const Board = mongoose.model('Board');
    project = await createTestProject(workspace._id, user._id);
    board = await Board.create({
      name: 'Test Board',
      project: project._id,
      columns: [
        { name: 'To Do', color: '#6b7280', order: 0 },
        { name: 'In Progress', color: '#3b82f6', order: 1 },
        { name: 'Done', color: '#10b981', order: 2 },
      ],
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Task', project: project._id, board: board._id, column: 'To Do' });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.column).toBe('To Do');
    });
  });

  describe('GET /api/tasks/board/:boardId', () => {
    it('should list board tasks', async () => {
      const res = await request(app)
        .get(`/api/tasks/board/${board._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PATCH /api/tasks/:id/move', () => {
    it('should move task between columns', async () => {
      const Task = mongoose.model('Task');
      const task = await Task.create({
        title: 'Movable Task',
        project: project._id,
        board: board._id,
        column: 'To Do',
        createdBy: user._id,
      });

      const res = await request(app)
        .patch(`/api/tasks/${task._id}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({ column: 'In Progress', boardId: board._id });
      expect(res.status).toBe(200);
      expect(res.body.data.column).toBe('In Progress');
    });
  });
});
