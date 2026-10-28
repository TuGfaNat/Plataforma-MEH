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

  cambiarPassword: async (password_actual, nuevo_password) => {
    const response = await api.put('/auth/me/password', { password_actual, nuevo_password });
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

  adminCreateUser: async (userData) => {
    const response = await api.post('/auth/admin/users', userData);
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

  getDirectorio: async ({ search = '', rol = '', sort_by = 'nombres', sort_order = 'asc', skip = 0, limit = 100 } = {}) => {
    let url = '/usuarios/directorio';
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (rol && rol !== 'Todos') params.append('rol', rol);
    if (sort_by) params.append('sort_by', sort_by);
    if (sort_order) params.append('sort_order', sort_order);
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);

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

  deleteUser: async (idUsuario) => {
    const response = await api.delete(`/auth/usuarios/${idUsuario}`);
    return response.data;
  },

  verificarEmail: async (correo, codigo) => {
    const response = await api.post('/auth/verificar-email', { correo, codigo });
    return response.data;
  },

  reenviarCodigo: async (correo) => {
    const response = await api.post('/auth/reenviar-codigo', { correo });
    return response.data;
  },

  adminUpdateUser: async (idUsuario, userData) => {
    const response = await api.put(`/auth/usuarios/${idUsuario}`, userData);
    return response.data;
  },

  adminResetPassword: async (idUsuario, nuevaPassword) => {
    const response = await api.post(`/auth/usuarios/${idUsuario}/reset-password`, { nueva_password: nuevaPassword });
    return response.data;
  },

  suspenderUsuario: async (idUsuario, motivo) => {
    const response = await api.post(`/auth/usuarios/${idUsuario}/suspender`, { motivo });
    return response.data;
  },

  restaurarUsuario: async (idUsuario) => {
    const response = await api.post(`/auth/usuarios/${idUsuario}/restaurar`);
    return response.data;
  },

  purgeSeedData: async () => {
    const response = await api.post('/auth/admin/purge-seed-data');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export default authService;
