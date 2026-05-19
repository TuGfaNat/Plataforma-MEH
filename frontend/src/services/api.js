import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const fallbackApiUrl = isLocal ? 'http://localhost:8000' : 'https://api-meh.onrender.com';

export const API_BASE_URL = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, '');

/**
 * Resuelve una ruta de archivo del backend a una URL absoluta funcional.
 * Maneja rutas relativas (/static/...), absolutas (http://...) y valores nulos.
 */
export const resolveApiFileUrl = (path) => {
  if (!path) return null;
  if (String(path).startsWith('http')) return path;
  
  // Limpiar slashes duplicados
  const cleanPath = String(path).replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para añadir el token JWT a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales (401, 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
