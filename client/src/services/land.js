import api from './api';

export const createLand = (data) => api.post('/lands', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getLands = (params) => api.get('/lands', { params });
export const getLandById = (id) => api.get(`/lands/${id}`);
export const updateLand = (id, data) => api.put(`/lands/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteLand = (id) => api.delete(`/lands/${id}`);
export const getMyLands = () => api.get('/lands/my');
export const getAllLandsAdmin = (params) => api.get('/lands/admin/all', { params });
export const verifyLand = (id, data) => api.put(`/lands/${id}/verify`, data);
