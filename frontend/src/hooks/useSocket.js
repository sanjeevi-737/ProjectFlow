import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { accessToken, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io('/', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        socketRef.current = null;
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      if (socket.retries >= socket._opts.reconnectionAttempts) {
        socket.disconnect();
        socketRef.current = null;
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken]);

  const joinWorkspace = useCallback((workspaceId) => {
    socketRef.current?.emit('workspace:join', workspaceId);
  }, []);

  const leaveWorkspace = useCallback((workspaceId) => {
    socketRef.current?.emit('workspace:leave', workspaceId);
  }, []);

  const joinProject = useCallback((projectId) => {
    socketRef.current?.emit('project:join', projectId);
  }, []);

  const leaveProject = useCallback((projectId) => {
    socketRef.current?.emit('project:leave', projectId);
  }, []);

  const joinBoard = useCallback((boardId) => {
    socketRef.current?.emit('board:join', boardId);
  }, []);

  const leaveBoard = useCallback((boardId) => {
    socketRef.current?.emit('board:leave', boardId);
  }, []);

  const emitTaskUpdate = useCallback((data) => {
    socketRef.current?.emit('task:update', data);
  }, []);

  const emitTaskMove = useCallback((data) => {
    socketRef.current?.emit('task:move', data);
  }, []);

  const emitComment = useCallback((data) => {
    socketRef.current?.emit('comment:add', data);
  }, []);

  const emitTypingStart = useCallback((data) => {
    socketRef.current?.emit('typing:start', data);
  }, []);

  const emitTypingStop = useCallback((data) => {
    socketRef.current?.emit('typing:stop', data);
  }, []);

  const onTaskUpdated = useCallback((callback) => {
    socketRef.current?.on('task:updated', callback);
    return () => socketRef.current?.off('task:updated', callback);
  }, []);

  const onTaskMoved = useCallback((callback) => {
    socketRef.current?.on('task:moved', callback);
    return () => socketRef.current?.off('task:moved', callback);
  }, []);

  const onCommentAdded = useCallback((callback) => {
    socketRef.current?.on('comment:added', callback);
    return () => socketRef.current?.off('comment:added', callback);
  }, []);

  const onTypingStarted = useCallback((callback) => {
    socketRef.current?.on('typing:started', callback);
    return () => socketRef.current?.off('typing:started', callback);
  }, []);

  const onTypingStopped = useCallback((callback) => {
    socketRef.current?.on('typing:stopped', callback);
    return () => socketRef.current?.off('typing:stopped', callback);
  }, []);

  const onNotificationReceived = useCallback((callback) => {
    socketRef.current?.on('notification:received', callback);
    return () => socketRef.current?.off('notification:received', callback);
  }, []);

  const onUsersOnline = useCallback((callback) => {
    socketRef.current?.on('users:online', callback);
    return () => socketRef.current?.off('users:online', callback);
  }, []);

  return {
    socket: socketRef.current,
    joinWorkspace,
    leaveWorkspace,
    joinProject,
    leaveProject,
    joinBoard,
    leaveBoard,
    emitTaskUpdate,
    emitTaskMove,
    emitComment,
    emitTypingStart,
    emitTypingStop,
    onTaskUpdated,
    onTaskMoved,
    onCommentAdded,
    onTypingStarted,
    onTypingStopped,
    onNotificationReceived,
    onUsersOnline,
  };
};
