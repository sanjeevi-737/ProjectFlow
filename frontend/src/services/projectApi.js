import api from './api';

export const projectApi = {
  create: (data) => api.post('/projects', data),
  getByWorkspace: (workspaceId, params) => api.get(`/projects/workspace/${workspaceId}`, { params }),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  archive: (id) => api.patch(`/projects/${id}/archive`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`),
  getBoards: (id) => api.get(`/projects/${id}/boards`),
};
