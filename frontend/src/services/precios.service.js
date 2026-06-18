import api from './api';

export const preciosService = {
  obtenerTodos: async () => {
    const { data } = await api.get('/precios');
    return data;
  },
  aplicarAumentoMasivo: async (porcentaje) => {
    const { data } = await api.post('/precios/aumento-masivo', { porcentaje });
    return data;
  },

  actualizarVehiculo: async (id, payload) => {
    const { data } = await api.put(`/precios/vehiculo/${id}`, payload);
    return data;
  },
  actualizarTramo: async (id, payload) => {
    const { data } = await api.put(`/precios/tramo/${id}`, payload);
    return data;
  }
};