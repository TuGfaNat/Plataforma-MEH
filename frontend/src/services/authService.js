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

  forgotPassword: async (correo) => {
    const response = await api.post('/auth/forgot-password', { correo });
    return response.data;
  },

  resetPassword: async (token, nuevo_password) => {
    const response = await api.post('/auth/reset-password', { token, nuevo_password });
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

  getAllUsers: async (search = '', rol = '') => {
    let url = '/auth/usuarios';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (rol) params.append('rol', rol);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  updateUserRole: async (idUsuario, nuevoRol) => {
    const response = await api.put(`/auth/usuarios/${idUsuario}/rol?nuevo_rol=${nuevoRol}`);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export default authService;
