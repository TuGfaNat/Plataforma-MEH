import api from './api';

const dashboardService = {
  getStats: async (role) => {
    const endpoint = role === 'ADMIN' ? '/dashboard/stats' : '/dashboard/personal-stats';
    const response = await api.get(endpoint);
    return response.data;
  }
};

export default dashboardService;
