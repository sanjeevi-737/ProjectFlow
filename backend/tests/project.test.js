import request from 'supertest';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB, createTestUser, createTestWorkspace, generateToken } from './setup.js';

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

describe('Project API', () => {
  let user, token, workspace;

  beforeEach(async () => {
    user = await createTestUser({ role: 'admin' });
    token = generateToken(user._id);
    workspace = await createTestWorkspace(user._id);
  });

  describe('POST /api/projects', () => {
    it('should create a project with default board', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Project', workspace: workspace._id });
      expect(res.status).toBe(201);
      expect(res.body.data.project.name).toBe('Test Project');
    });

    it('should require name', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ workspace: workspace._id });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects/workspace/:workspaceId', () => {
    it('should list workspace projects', async () => {
      const res = await request(app)
        .get(`/api/projects/workspace/${workspace._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
