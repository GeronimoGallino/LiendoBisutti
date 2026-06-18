import api from './api';

export const preciosService = {
  obtenerTodos: async () => {
    const { data } = await api.get('/precios');
    return data;
  },
  
  aplicarAumentoMasivo: async (porcentaje) => {
    const { data } = await api.post('/precios/aumento-masivo', { porcentaje });
    return data;
  }
};