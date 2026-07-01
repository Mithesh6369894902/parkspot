import api from './api';

export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getLandBookings = (landId) => api.get(`/bookings/land/${landId}`);
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id, data) => api.put(`/bookings/${id}/cancel`, data);
export const updateBookingStatus = (id, data) => api.put(`/bookings/${id}/status`, data);
export const checkAvailability = (params) => api.get('/bookings/availability', { params });
