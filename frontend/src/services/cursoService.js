import api from './api';

const cursoService = {
  getCursos: async () => {
    const response = await api.get('/cursos/');
    return response.data;
  },
  inscribirseCurso: async (idCurso) => {
    const response = await api.post(`/inscripciones/cursos/${idCurso}`);
    return response.data;
  },
  getCurso: async (id) => {
    const response = await api.get(`/cursos/${id}`);
    return response.data;
  },
  getLeccionesCurso: async (idCurso) => {
    const response = await api.get(`/academia/cursos/${idCurso}/lecciones`);
    return response.data;
  },
  createCurso: async (cursoData) => {
    const response = await api.post('/cursos/', cursoData);
    return response.data;
  },
  getMisCertificados: async () => {
    const response = await api.get('/cursos/mis-certificados');
    return response.data;
  },
  
  // PROXY MICROSOFT LEARNING
  getMSCatalog: async () => {
    const response = await api.get('/ms-learning/catalog');
    return response.data;
  },

  // RUTAS DE INSTRUCTOR
  getMisCursosDocente: async () => {
    const response = await api.get('/cursos/instructor/mis-cursos');
    return response.data;
  },
  getAlumnosCurso: async (idCurso) => {
    const response = await api.get(`/cursos/instructor/curso/${idCurso}/alumnos`);
    return response.data;
  },
  setNotaAlumno: async (idInscripcion, nota) => {
    const response = await api.put(`/cursos/instructor/nota/${idInscripcion}?nota=${nota}`);
    return response.data;
  }
};

export default cursoService;
