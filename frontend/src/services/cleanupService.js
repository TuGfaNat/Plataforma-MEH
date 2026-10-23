import api from './api';

const cleanupService = {
  getStatus: async () => {
    const res = await api.get('/admin/cleanup/status');
    return res.data;
  },

  getCatalog: async () => {
    const res = await api.get('/admin/cleanup/catalog');
    return res.data;
  },

  getTableRows: async (tabla, params = {}) => {
    const res = await api.get(`/admin/cleanup/tables/${tabla}/rows`, { params });
    return res.data;
  },

  getProtectedConfig: async () => {
    const res = await api.get('/admin/cleanup/protected');
    return res.data;
  },

  updateWhitelist: async (emails) => {
    const res = await api.put('/admin/cleanup/protected/whitelist', { emails });
    return res.data;
  },

  getPresets: async () => {
    const res = await api.get('/admin/cleanup/presets');
    return res.data;
  },

  savePreset: async (payload) => {
    const res = await api.post('/admin/cleanup/presets', payload);
    return res.data;
  },

  deletePreset: async (presetId) => {
    const res = await api.delete(`/admin/cleanup/presets/${presetId}`);
    return res.data;
  },

  resolvePreset: async (presetId) => {
    const res = await api.post(`/admin/cleanup/presets/${presetId}/resolve`);
    return res.data;
  },

  previewCleanup: async (payload) => {
    const res = await api.post('/admin/cleanup/preview', payload);
    return res.data;
  },

  createBackup: async (payload) => {
    const res = await api.post('/admin/cleanup/backup', payload);
    return res.data;
  },

  downloadBackup: async (backupId) => {
    const res = await api.get(`/admin/cleanup/backup/${backupId}`);
    return res.data;
  },

  executeCleanup: async (payload) => {
    const res = await api.post('/admin/cleanup/execute', payload);
    return res.data;
  },
};

export default cleanupService;
