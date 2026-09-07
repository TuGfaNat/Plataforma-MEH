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
  },

  cancelarInscripcion: async (idInscripcion) => {
    const response = await api.delete(`/inscripciones/eventos/${idInscripcion}`);
    return response.data;
  },

  aprobarInscripcion: async (idInscripcion) => {
    const response = await api.put(`/inscripciones/eventos/${idInscripcion}/aprobar`);
    return response.data;
  },

  getListaEspera: async (idEvento) => {
    const response = await api.get(`/inscripciones/eventos/${idEvento}/lista-espera`);
    return response.data;
  },

  getParticipantes: async (idEvento) => {
    const response = await api.get(`/inscripciones/eventos/${idEvento}/participantes`);
    return response.data;
  },

  getEventoTokenQr: async (idEvento) => {
    const response = await api.get(`/eventos/${idEvento}/token-qr`);
    return response.data;
  },

  downloadEventoQr: async (idEvento, titulo = 'evento') => {
    const response = await api.get(`/eventos/${idEvento}/qr-image`, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `QR_Evento_${idEvento}_${titulo.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }
};

export default eventoService;
