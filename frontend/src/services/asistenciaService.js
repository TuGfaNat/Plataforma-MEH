import api from './api';

const asistenciaService = {
  getActividades: async () => {
    const response = await api.get('/asistencia/actividades');
    return response.data;
  },
  registrar: async (tipo, idActividad, idUsuario) => {
    const response = await api.post(`/asistencia/registrar?tipo=${tipo}&id_actividad=${idActividad}&id_usuario=${idUsuario}`);
    return response.data;
  },
  registrarPorQR: async (codigoQR, idCheckpoint = null) => {
    const payload = { codigo_qr: codigoQR };
    if (idCheckpoint) payload.id_checkpoint = idCheckpoint;

    const response = await api.post(`/eventos/asistencia-qr`, payload);
    return response.data;
  },
  getCheckpoints: async (idEvento) => {
    const response = await api.get(`/eventos/${idEvento}/checkpoints`);
    return response.data;
  },
  createCheckpoint: async (idEvento, data) => {
    const response = await api.post(`/eventos/${idEvento}/checkpoints`, data);
    return response.data;
  }
};

export default asistenciaService;
