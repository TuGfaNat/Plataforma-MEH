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

  inscribirse: async (idEvento, { idempotency_key } = {}) => {
    const config = {};
    if (idempotency_key) {
      config.headers = { 'X-Idempotency-Key': idempotency_key };
    }
    const response = await api.post(`/inscripciones/eventos/${idEvento}`, {}, config);
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
  },

  acreditarParticipante: async (idEvento, payload) => {
    const response = await api.post(`/eventos/${idEvento}/acreditar`, payload);
    return response.data;
  },

  cancelarEvento: async (idEvento, motivo) => {
    const response = await api.post(`/eventos/${idEvento}/cancelar`, { motivo });
    return response.data;
  },

  avisarInscritos: async (idEvento, data) => {
    const response = await api.post(`/eventos/${idEvento}/avisar`, data);
    return response.data;
  },

  exportInscritosCsv: async (idEvento, titulo = '') => {
    const response = await api.get(`/eventos/${idEvento}/inscritos.csv`, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    const safeTitle = titulo ? `_${titulo.replace(/\s+/g, '_')}` : '';
    link.download = `inscritos_evento_${idEvento}${safeTitle}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },

  aprobarListaEsperaLote: async (idEvento, cantidad = null) => {
    const payload = cantidad ? { cantidad } : {};
    const response = await api.post(`/eventos/${idEvento}/aprobar-lista-espera`, payload);
    return response.data;
  },

  duplicarEvento: async (idEvento) => {
    const response = await api.post(`/eventos/${idEvento}/duplicar`);
    return response.data;
  },

  getLlegadas: async (idEvento) => {
    const response = await api.get(`/eventos/${idEvento}/llegadas`);
    return response.data;
  },

  getBadgeInfo: async (idEvento) => {
    const response = await api.get(`/eventos/${idEvento}/badge-info`);
    return response.data;
  },

  uploadPlantillaBadge: async (idEvento, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/eventos/${idEvento}/plantilla-badge`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadImagenBorrador: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/eventos/imagen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadEventoImagen: async (idEvento, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/eventos/${idEvento}/imagen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteEventoImagen: async (idEvento) => {
    const response = await api.delete(`/eventos/${idEvento}/imagen`);
    return response.data;
  },

  getInscritosConfirmados: async (idEvento) => {
    const response = await api.get(`/eventos/${idEvento}/inscritos-confirmados`);
    return response.data;
  }
};

export default eventoService;
