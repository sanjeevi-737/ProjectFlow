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

describe('Workspace API', () => {
  let user, token, workspace;

  beforeEach(async () => {
    user = await createTestUser({ role: 'admin' });
    token = generateToken(user._id);
    workspace = await createTestWorkspace(user._id);
  });

  describe('POST /api/workspaces', () => {
    it('should create a workspace', async () => {
      const res = await request(app)
        .post('/api/workspaces')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Workspace', description: 'Test description' });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('New Workspace');
      expect(res.body.data.members).toHaveLength(1);
    });

    it('should require authentication', async () => {
      const res = await request(app).post('/api/workspaces').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/workspaces', () => {
    it('should list user workspaces', async () => {
      const res = await request(app)
        .get('/api/workspaces')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/workspaces/:id', () => {
    it('should get workspace by id', async () => {
      const res = await request(app)
        .get(`/api/workspaces/${workspace._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(workspace._id.toString());
    });
  });

  describe('PATCH /api/workspaces/:id', () => {
    it('should update workspace', async () => {
      const res = await request(app)
        .patch(`/api/workspaces/${workspace._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Workspace' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Workspace');
    });
  });
});
