const BASE = '/api';

let adminPassword = sessionStorage.getItem('adminPassword') || '';

export function setAdminPassword(pw) {
  adminPassword = pw;
  sessionStorage.setItem('adminPassword', pw);
}

export function getAdminPassword() {
  return adminPassword;
}

export function clearAdminPassword() {
  adminPassword = '';
  sessionStorage.removeItem('adminPassword');
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(adminPassword ? { 'x-admin-password': adminPassword } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Public
export const getProjects = () => request('/projects');
export const getProject = (slug) => request(`/projects/${slug}`);

// Admin auth
export const verifyAdmin = (password) =>
  request('/admin/verify', { method: 'POST', body: JSON.stringify({ password }) });

// Admin - projects
export const createProject = (data) =>
  request('/admin/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id, data) =>
  request(`/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id) =>
  request(`/admin/projects/${id}`, { method: 'DELETE' });

// Admin - models
export const getAdminModels = (projectId) =>
  request(`/admin/projects/${projectId}/models`);

export function uploadModel(projectId, file, name, notes) {
  const form = new FormData();
  form.append('file', file);
  if (name) form.append('name', name);
  if (notes) form.append('notes', notes);
  return request(`/admin/projects/${projectId}/models`, { method: 'POST', body: form });
}

export const updateModel = (id, data) =>
  request(`/admin/models/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteModel = (id) =>
  request(`/admin/models/${id}`, { method: 'DELETE' });

// Admin - details
export const createDetail = (projectId, data) =>
  request(`/admin/projects/${projectId}/details`, { method: 'POST', body: JSON.stringify(data) });
export const updateDetail = (id, data) =>
  request(`/admin/details/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDetail = (id) =>
  request(`/admin/details/${id}`, { method: 'DELETE' });
