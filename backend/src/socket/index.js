import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const onlineUsers = new Map();
let io = null;

export const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, config.jwt.accessSecret);
      socket.userId = decoded.userId;
      next();
    } catch { next(new Error('Invalid token')); }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`User connected: ${userId}`);

    onlineUsers.set(userId, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));

    socket.join(`user:${userId}`);

    socket.on('workspace:join', (workspaceId) => socket.join(`workspace:${workspaceId}`));
    socket.on('workspace:leave', (workspaceId) => socket.leave(`workspace:${workspaceId}`));
    socket.on('project:join', (projectId) => socket.join(`project:${projectId}`));
    socket.on('project:leave', (projectId) => socket.leave(`project:${projectId}`));
    socket.on('board:join', (boardId) => socket.join(`board:${boardId}`));
    socket.on('board:leave', (boardId) => socket.leave(`board:${boardId}`));
    socket.on('task:join', (taskId) => socket.join(`task:${taskId}`));
    socket.on('task:leave', (taskId) => socket.leave(`task:${taskId}`));

    socket.on('typing:start', ({ taskId, userId, name }) => {
      socket.to(`task:${taskId}`).emit('typing:started', { userId, name });
    });

    socket.on('typing:stop', ({ taskId, userId }) => {
      socket.to(`task:${taskId}`).emit('typing:stopped', { userId });
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export const getIO = () => io;
export const getOnlineUsers = () => Array.from(onlineUsers.keys());

export const emitToUser = (userId, event, data) => {
  io?.to(`user:${userId}`).emit(event, data);
};

export const emitToBoard = (boardId, event, data) => {
  io?.to(`board:${boardId}`).emit(event, data);
};

export const emitToProject = (projectId, event, data) => {
  io?.to(`project:${projectId}`).emit(event, data);
};

export const emitToTask = (taskId, event, data) => {
  io?.to(`task:${taskId}`).emit(event, data);
};

export const emitToAll = (event, data) => {
  io?.emit(event, data);
};
