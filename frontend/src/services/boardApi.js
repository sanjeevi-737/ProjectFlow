import api from './api';

export const boardApi = {
  create: (data) => api.post('/boards', data),
  getByProject: (projectId) => api.get(`/boards/project/${projectId}`),
  getById: (id) => api.get(`/boards/${id}`),
  update: (id, data) => api.patch(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  addColumn: (id, data) => api.post(`/boards/${id}/columns`, data),
  updateColumn: (id, columnId, data) => api.patch(`/boards/${id}/columns/${columnId}`, data),
  deleteColumn: (id, columnId) => api.delete(`/boards/${id}/columns/${columnId}`),
  reorderColumns: (id, columnIds) => api.patch(`/boards/${id}/columns/reorder`, { columnIds }),
};
