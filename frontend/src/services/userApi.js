import api from './api';

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  updateAvatar: (formData) => api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.patch('/users/change-password', data),
  updateNotificationPreferences: (data) => api.patch('/users/notification-preferences', data),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  getAllUsers: (params) => api.get('/users', { params }),
};
