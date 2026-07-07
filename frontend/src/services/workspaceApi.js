import api from './api';

export const workspaceApi = {
  create: (data) => api.post('/workspaces', data),
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  update: (id, data) => api.patch(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
  inviteMember: (id, data) => api.post(`/workspaces/${id}/invite`, data),
  acceptInvitation: (data) => api.post('/workspaces/accept-invitation', data),
  getInvitations: (id) => api.get(`/workspaces/${id}/invitations`),
  removeMember: (id, memberId) => api.delete(`/workspaces/${id}/members/${memberId}`),
  updateMemberRole: (id, memberId, role) => api.patch(`/workspaces/${id}/members/${memberId}/role`, { role }),
};
