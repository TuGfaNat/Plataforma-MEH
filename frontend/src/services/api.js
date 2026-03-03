import axios from 'axios';

const api = axios.create({
  // Cambiamos localhost por la URL real de Render
  baseURL: 'https://api-meh.onrender.com',
});

// Interceptor para añadir el token JWT a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
