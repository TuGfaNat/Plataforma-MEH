import api from './api';

const comunidadService = {
  getMiembros: async () => {
    const response = await api.get('/comunidad/miembros');
    return response.data;
  },

  getAnuncios: async () => {
    const response = await api.get('/comunidad/anuncios');
    return response.data;
  },

  crearAnuncio: async (anuncioData) => {
    const response = await api.post('/comunidad/anuncios', anuncioData);
    return response.data;
  }
};

export default comunidadService;
