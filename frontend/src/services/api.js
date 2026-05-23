import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Más adelante acá agregaremos el interceptor para el token:
// api.interceptors.request.use(...)
// api.interceptors.response.use(...)

export default api;