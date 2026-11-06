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
  updateSpeaker: async (id, data) => {
    const response = await api.put(`/admin-directories/speakers/${id}`, data);
    return response.data;
  },
  deleteSpeaker: async (id) => {
    const response = await api.delete(`/admin-directories/speakers/${id}`);
    return response.data;
  },
  getMentores: async () => {
    const response = await api.get('/admin-directories/mentores');
    return response.data;
  },
  createMentor: async (data) => {
    const response = await api.post('/admin-directories/mentores', data);
    return response.data;
  },
  updateMentor: async (id, data) => {
    const response = await api.put(`/admin-directories/mentores/${id}`, data);
    return response.data;
  },
  deleteMentor: async (id) => {
    const response = await api.delete(`/admin-directories/mentores/${id}`);
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
  getSouvenirById: async (id) => {
    const response = await api.get(`/souvenirs/${id}`);
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
  },
  registrarVentaSouvenir: async (idUsuario, items, metodoPago = 'EFECTIVO', idEvento = null, notas = null) => {
    const response = await api.post('/souvenirs/ventas', {
      id_usuario: idUsuario,
      items,
      metodo_pago: metodoPago,
      id_evento: idEvento ? Number(idEvento) : null,
      notas: notas || null
    });
    return response.data;
  },
  getVentasSouvenirs: async (idEvento = null) => {
    const params = idEvento ? { id_evento: idEvento } : {};
    const response = await api.get('/souvenirs/ventas', { params });
    return response.data;
  }
};

export default adminService;
