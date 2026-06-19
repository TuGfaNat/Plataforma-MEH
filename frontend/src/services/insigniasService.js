import api from './api';

const insigniasService = {
  getInsignias: async () => {
    const response = await api.get('/insignias/');
    return response.data;
  },

  getMisInsignias: async (idUsuario) => {
    const response = await api.get(`/insignias/usuario/${idUsuario}`);
    return response.data;
  },

  createInsignia: async (insigniaData) => {
    const response = await api.post('/insignias/', insigniaData);
    return response.data;
  },

  updateInsignia: async (idBadge, insigniaData) => {
    const response = await api.put(`/insignias/${idBadge}`, insigniaData);
    return response.data;
  },

  deleteInsignia: async (idBadge) => {
    const response = await api.delete(`/insignias/${idBadge}`);
    return response.data;
  }
};

export default insigniasService;
