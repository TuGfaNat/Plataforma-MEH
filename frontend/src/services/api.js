import axios from 'axios';

// Detectar si estamos en local o en producción
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  // Si es local usa puerto 8000, si no usa la URL de Render
  baseURL: isLocal 
    ? 'http://localhost:8000' 
    : 'https://api-meh.onrender.com',
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
