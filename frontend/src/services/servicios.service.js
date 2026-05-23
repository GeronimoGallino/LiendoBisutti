// frontend/src/services/servicios.service.js

import api from './api';

export const serviciosService = {
  obtenerTodos: async () => {
    const { data } = await api.get('/servicios');
    return data;
  }
};