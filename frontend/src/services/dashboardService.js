import api from './api';

const dashboardService = {
  getStats: async (role) => {
    const endpoint = role === 'ADMIN' ? '/dashboard/stats' : '/dashboard/personal-stats';
    const response = await api.get(endpoint);
    return response.data;
  },

  getFilteredStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.q && filters.q.trim()) params.append('q', filters.q.trim());
    if (filters.modalidad && filters.modalidad !== 'Todos' && filters.modalidad !== 'Todas' && filters.modalidad !== '') {
      params.append('modalidad', filters.modalidad);
    }
    if (filters.estado && filters.estado !== 'Todos' && filters.estado !== 'Todas' && filters.estado !== '') {
      params.append('estado', filters.estado);
    }
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.id_eventos) params.append('id_eventos', filters.id_eventos);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/dashboard/stats${qs}`);
    return response.data;
  }
};

export default dashboardService;
