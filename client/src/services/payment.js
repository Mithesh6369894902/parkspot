import api from './api';

export const createOrder = (data) => api.post('/payments/create-order', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);
export const getPaymentStatus = (id) => api.get(`/payments/${id}`);
export const refundPayment = (id) => api.post(`/payments/${id}/refund`);
