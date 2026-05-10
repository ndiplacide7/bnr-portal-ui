import client from './client';

export const listUsers = (page = 0, size = 20) =>
  client.get('/admin/users', { params: { page, size } });

export const createUser = (data) =>
  client.post('/admin/users', data);

export const deactivateUser = (id) =>
  client.patch(`/admin/users/${id}/deactivate`);

export const listAuditLogs = (page = 0, size = 20) =>
  client.get('/admin/audit-logs', { params: { page, size, sort: 'createdAt,desc' } });

export const listAuditLogsForApplication = (applicationId, page = 0, size = 20) =>
  client.get(`/admin/audit-logs/applications/${applicationId}`, {
    params: { page, size, sort: 'createdAt,desc' },
  });
