import api from './api';

const comunidadService = {
  getMiembros: async () => {
    const response = await api.get('/comunidad/miembros');
    return response.data;
  },

  getMiembroDetalle: async (idUsuario) => {
    const response = await api.get(`/comunidad/miembros/${idUsuario}`);
    return response.data;
  },

  getAnuncios: async () => {
    const response = await api.get('/comunidad/anuncios');
    return response.data;
  },

  getAllAnuncios: async () => {
    const response = await api.get('/comunidad/anuncios/all');
    return response.data;
  },

  crearAnuncio: async (anuncioData) => {
    const response = await api.post('/comunidad/anuncios', anuncioData);
    return response.data;
  },

  actualizarAnuncio: async (idAnuncio, anuncioData) => {
    const response = await api.put(`/comunidad/anuncios/${idAnuncio}`, anuncioData);
    return response.data;
  },

  eliminarAnuncio: async (idAnuncio) => {
    const response = await api.delete(`/comunidad/anuncios/${idAnuncio}`);
    return response.data;
  }
};

export default comunidadService;
