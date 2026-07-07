import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../src/config/index.js';

let mongoServer;

export const setupTestDB = async () => {
  process.env.MONGOMS_SYSTEM_BINARY = 'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe';
  process.env.MONGOMS_VERSION = '8.3.0';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const teardownTestDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const createTestUser = async (overrides = {}) => {
  const User = mongoose.model('User');
  const { password: overridePassword, ...rest } = overrides;
  const rawPassword = overridePassword || 'TestPass123';
  const hashed = await bcrypt.hash(rawPassword, 12);
  const user = await User.create({
    name: rest.name || 'Test User',
    email: rest.email || 'test@example.com',
    password: hashed,
    isEmailVerified: true,
    role: rest.role || 'team_member',
    ...rest,
  });
  return user;
};

export const createTestWorkspace = async (ownerId, overrides = {}) => {
  const Workspace = mongoose.model('Workspace');
  return Workspace.create({
    name: overrides.name || 'Test Workspace',
    owner: ownerId,
    members: [{ user: ownerId, role: 'admin' }],
    ...overrides,
  });
};

export const createTestProject = async (workspaceId, ownerId, overrides = {}) => {
  const Project = mongoose.model('Project');
  return Project.create({
    name: overrides.name || 'Test Project',
    workspace: workspaceId,
    owner: ownerId,
    members: [{ user: ownerId, role: 'admin' }],
    ...overrides,
  });
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.accessSecret, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: '7d' });
};
