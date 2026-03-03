import api from './api';

const cursoService = {
  // Obtener todos los cursos activos
  getCursos: async () => {
    const response = await api.get('/cursos/');
    return response.data;
  },

  // Obtener un curso por ID
  getCurso: async (id) => {
    const response = await api.get(`/cursos/${id}`);
    return response.data;
  },

  // Obtener mis certificados
  getMisCertificados: async () => {
    const response = await api.get('/cursos/mis-certificados');
    return response.data;
  },

  // Simular inscripción o progreso (esto se puede ampliar luego)
  inscribirseCurso: async (idCurso) => {
    const response = await api.post(`/inscripciones/cursos/${idCurso}`);
    return response.data;
  }
};

export default cursoService;
