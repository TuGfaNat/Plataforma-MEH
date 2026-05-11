import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const fallbackApiUrl = isLocal ? 'http://localhost:8000' : 'https://api-meh.onrender.com';

export const API_BASE_URL = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, '');

export const resolveApiFileUrl = (path = '') => `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;

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

export default api;
