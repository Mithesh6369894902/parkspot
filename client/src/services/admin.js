import api from './api';

export const getDashboardStats = () => api.get('/admin/dashboard');
export const createDispute = (data) => api.post('/admin/disputes', data);
export const getDisputes = (params) => api.get('/admin/disputes', { params });
export const updateDispute = (id, data) => api.put(`/admin/disputes/${id}`, data);
export const addDisputeMessage = (id, data) => api.post(`/admin/disputes/${id}/messages`, data);
