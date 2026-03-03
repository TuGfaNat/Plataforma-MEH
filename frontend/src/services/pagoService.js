import api from './api';

const pagoService = {
  uploadComprobante: async (formData) => {
    const response = await api.post('/pagos/upload-comprobante', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getMisPagos: async () => {
    const response = await api.get('/pagos/mis-pagos');
    return response.data;
  },

  // Admin methods
  getAllPagos: async () => {
    const response = await api.get('/pagos/admin/todos');
    return response.data;
  },

  validarPago: async (idPago, estado) => {
    const response = await api.put(`/pagos/admin/${idPago}/validar`, { estado_pago: estado });
    return response.data;
  }
};

export default pagoService;
