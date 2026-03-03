import api from './api';

const eventoService = {
  getEventos: async () => {
    const response = await api.get('/eventos/');
    return response.data;
  },

  getEvento: async (id) => {
    const response = await api.get(`/eventos/${id}`);
    return response.data;
  },

  inscribirse: async (idEvento) => {
    const response = await api.post(`/inscripciones/eventos/${idEvento}`);
    return response.data;
  },

  getMisInscripciones: async () => {
    const response = await api.get('/inscripciones/eventos/mis-inscripciones');
    return response.data;
  },

  createEvento: async (eventoData) => {
    const response = await api.post('/eventos/', eventoData);
    return response.data;
  },

  registrarAsistencia: async (idEvento, tokenQr, idUsuario) => {
    const response = await api.post(`/eventos/${idEvento}/asistencia-qr?token_qr=${tokenQr}&id_usuario=${idUsuario}`);
    return response.data;
  }
};

export default eventoService;
