import api from './api';

const recursoService = {
  getRecursos: async (categoria = '') => {
    const url = categoria ? `/recursos/?categoria=${categoria}` : '/recursos/';
    const response = await api.get(url);
    return response.data;
  },
  createRecurso: async (recursoData) => {
    const response = await api.post('/recursos/', recursoData);
    return response.data;
  },
  deleteRecurso: async (id) => {
    const response = await api.delete(`/recursos/${id}`);
    return response.data;
  }
};

export default recursoService;
