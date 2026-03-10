import api from './api';

const authService = {
  login: async (correo, password) => {
    const response = await api.post('/auth/login', { correo, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  loginWithGoogle: async (googleToken) => {
    const response = await api.post('/auth/google', { token: googleToken });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateMe: async (userData) => {
    const response = await api.put('/auth/me', userData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/auth/usuarios');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export default authService;
