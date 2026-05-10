import client from './client';

export const listApplications = (page = 0, size = 20) =>
  client.get('/applications', { params: { page, size, sort: 'createdAt,desc' } });

export const getApplication = (id) =>
  client.get(`/applications/${id}`);

export const createApplication = (data) =>
  client.post('/applications', data);

export const submitApplication = (id) =>
  client.patch(`/applications/${id}/submit`);

export const assignReviewer = (id, reviewerId) =>
  client.patch(`/applications/${id}/assign`, null, { params: { reviewerId } });

export const completeReview = (id) =>
  client.patch(`/applications/${id}/complete-review`);

export const decideApplication = (id, data) =>
  client.patch(`/applications/${id}/decide`, data);

export const withdrawApplication = (id, reason) =>
  client.patch(`/applications/${id}/withdraw`, { reason });
