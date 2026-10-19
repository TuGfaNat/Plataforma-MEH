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

  uploadComprobanteOcr: async (formData) => {
    const response = await api.post('/pagos/upload-comprobante-ocr', formData, {
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

  validarPago: async (idPago, estado, notasAdmin = null) => {
    const payload = { estado_pago: estado };
    if (notasAdmin) payload.notas_admin = notasAdmin;
    const response = await api.put(`/pagos/admin/${idPago}/validar`, payload);
    return response.data;
  },

  procesarExtracto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/pagos/admin/ocrm-match', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEventPaymentPackages: async (idEvento) => {
    const response = await api.get(`/eventos/${idEvento}/pagos-qr`);
    return response.data;
  },

  reembolsarPago: async (idPago, motivo) => {
    const response = await api.post(`/pagos/${idPago}/reembolsar`, { motivo });
    return response.data;
  },

  getHistorialPagos: async (idPago = null) => {
    const response = await api.get('/pagos/historial', {
      params: idPago ? { id_pago: idPago } : {}
    });
    return response.data;
  },

  reintentarPago: async (idPago, formData) => {
    const response = await api.post(`/pagos/${idPago}/reintentar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updatePagoQr: async (idQr, formData) => {
    const response = await api.put(`/eventos/pagos-qr/${idQr}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deletePagoQr: async (idQr) => {
    const response = await api.delete(`/eventos/pagos-qr/${idQr}`);
    return response.data;
  }
};

export default pagoService;
