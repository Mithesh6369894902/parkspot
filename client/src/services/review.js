import api from './api';

export const createReview = (data) => api.post('/reviews', data);
export const getLandReviews = (landId) => api.get(`/reviews/land/${landId}`);
export const replyToReview = (id, data) => api.put(`/reviews/${id}/reply`, data);
