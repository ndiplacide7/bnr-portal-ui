import client from './client';

export const listDocuments = (applicationId) =>
  client.get(`/applications/${applicationId}/documents`);

export const uploadDocument = (applicationId, file, documentType) => {
  const form = new FormData();
  form.append('file', file);
  form.append('documentType', documentType);
  return client.post(`/applications/${applicationId}/documents`, form);
};
