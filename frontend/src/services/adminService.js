import api from './api';

const adminService = {
  getSpeakers: async () => {
    const response = await api.get('/admin-directories/speakers');
    return response.data;
  },
  createSpeaker: async (data) => {
    const response = await api.post('/admin-directories/speakers', data);
    return response.data;
  },
  getAuspiciadores: async () => {
    const response = await api.get('/admin-directories/auspiciadores');
    return response.data;
  },
  createAuspiciador: async (data) => {
    const response = await api.post('/admin-directories/auspiciadores', data);
    return response.data;
  },
  getComunidades: async () => {
    const response = await api.get('/admin-directories/comunidades');
    return response.data;
  },
  createComunidad: async (data) => {
    const response = await api.post('/admin-directories/comunidades', data);
    return response.data;
  },
  getSouvenirs: async () => {
    const response = await api.get('/souvenirs/');
    return response.data;
  },
  createSouvenir: async (data) => {
    const response = await api.post('/souvenirs/', data);
    return response.data;
  },
  updateSouvenir: async (id, data) => {
    const response = await api.put(`/souvenirs/${id}`, data);
    return response.data;
  },
  deleteSouvenir: async (id) => {
    const response = await api.delete(`/souvenirs/${id}`);
    return response.data;
  }
};

export default adminService;
