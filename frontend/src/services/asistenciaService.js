import api from './api';

const asistenciaService = {
  getActividades: async () => {
    const response = await api.get('/asistencia/actividades');
    return response.data;
  },
  registrar: async (tipo, idActividad, idUsuario) => {
    const response = await api.post(`/asistencia/registrar?tipo=${tipo}&id_actividad=${idActividad}&id_usuario=${idUsuario}`);
    return response.data;
  }
};

export default asistenciaService;
