import api from './api';

export const taskApi = {
  create: (data) => api.post('/tasks', data),
  getByBoard: (boardId) => api.get(`/tasks/board/${boardId}`),
  getByProject: (projectId, params) => api.get(`/tasks/project/${projectId}`, { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  move: (id, data) => api.patch(`/tasks/${id}/move`, data),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
  getComments: (id) => api.get(`/tasks/${id}/comments`),
  deleteComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
  updateChecklist: (id, checklist) => api.patch(`/tasks/${id}/checklist`, { checklist }),
  updateSubtasks: (id, subtasks) => api.patch(`/tasks/${id}/subtasks`, { subtasks }),
  addAttachment: (id, formData) => api.post(`/tasks/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeAttachment: (id, attachmentId) => api.delete(`/tasks/${id}/attachments/${attachmentId}`),
  getActivityLog: (id) => api.get(`/tasks/${id}/activity`),
};
