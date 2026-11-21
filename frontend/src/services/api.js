import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
});

export const api = {
  // Applications
  async getApplications(params = {}) {
    const res = await client.get('/applications', { params });
    return res.data;
  },

  async getApplication(id) {
    const res = await client.get(`/applications/${id}`);
    return res.data;
  },

  async createApplication(data) {
    const res = await client.post('/applications', data);
    return res.data;
  },

  async updateApplication(id, data) {
    const res = await client.put(`/applications/${id}`, data);
    return res.data;
  },

  async deleteApplication(id) {
    const res = await client.delete(`/applications/${id}`);
    return res.data;
  },

  async addTimeline(id, note, status_changed_to = null) {
    const res = await client.post(`/applications/${id}/timeline`, {
      note,
      status_changed_to
    });
    return res.data;
  },

  // Stats & Reminders
  async getStats() {
    const res = await client.get('/stats');
    return res.data;
  },

  async getReminderDigest() {
    const res = await client.get('/reminders/digest');
    return res.data;
  },

  // File Upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Export CSV URL
  getExportCsvUrl(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        params.append(k, v);
      }
    });
    return `${API_BASE_URL}/api/applications/export/csv?${params.toString()}`;
  },

  // Resolve screenshot full URL
  resolveMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }
};
